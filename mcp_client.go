package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

// SessionData stores the session information
type SessionData struct {
	SessionID   string
	PhoneNumber string
}

// MCPClient represents a client for the Model Context Protocol
type MCPClient struct {
	serverURL  string
	conn       *websocket.Conn
	sessionID  string
	httpClient *http.Client
}

// Initialize the MCP client and authenticate
func NewMCPClient(serverURL, sessionID, phoneNumber string) (*MCPClient, error) {
	client := &MCPClient{
		serverURL:  serverURL,
		sessionID:  sessionID,
		httpClient: &http.Client{},
	}

	// Connect to the WebSocket (authentication should already be done in the browser)
	err := client.connect()
	if err != nil {
		return nil, fmt.Errorf("connection failed: %w", err)
	}

	return client, nil
}

// Authenticate the session with the server
func (c *MCPClient) authenticate(phoneNumber string) error {
	// First, we need to visit the mockWebPage endpoint to get the login form
	mockURL := fmt.Sprintf("http://%s/mockWebPage?sessionId=%s", 
		strings.TrimPrefix(c.serverURL, "ws://"), c.sessionID)
	
	fmt.Printf("Accessing mock web page at: %s\n", mockURL)
	_, err := c.httpClient.Get(mockURL)
	if err != nil {
		return fmt.Errorf("failed to access mock web page: %w", err)
	}
	
	// Now perform the actual login
	loginURL := fmt.Sprintf("http://%s/login", strings.TrimPrefix(c.serverURL, "ws://"))
	formData := url.Values{
		"sessionId":   {c.sessionID},
		"phoneNumber": {phoneNumber},
	}

	fmt.Printf("Sending login request to: %s\n", loginURL)
	req, err := http.NewRequest("POST", loginURL, strings.NewReader(formData.Encode()))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("login failed with status code: %d", resp.StatusCode)
	}

	fmt.Println("Authentication successful!")
	return nil
}

// Connect to the WebSocket server
func (c *MCPClient) connect() error {
	// Add session ID as query parameter
	u, err := url.Parse(c.serverURL)
	if err != nil {
		return err
	}
	
	query := u.Query()
	query.Set("sessionId", c.sessionID)
	u.RawQuery = query.Encode()

	// Set up WebSocket connection
	dialer := websocket.Dialer{
		HandshakeTimeout: 45 * time.Second,
	}

	header := http.Header{}
	header.Add("Origin", fmt.Sprintf("http://%s", strings.TrimPrefix(c.serverURL, "ws://")))
	// Also add the session ID as a header just to be safe
	header.Add("X-Session-ID", c.sessionID)

	fmt.Printf("Connecting to %s\n", u.String())
	conn, resp, err := dialer.Dial(u.String(), header)
	if err != nil {
		if resp != nil {
			fmt.Printf("WebSocket connection failed with status: %d\n", resp.StatusCode)
		}
		return err
	}

	c.conn = conn
	fmt.Println("WebSocket connection established!")
	return nil
}

// Close the WebSocket connection
func (c *MCPClient) Close() {
	if c.conn != nil {
		c.conn.Close()
	}
}

// Call a tool on the MCP server
func (c *MCPClient) CallTool(toolName string, parameters map[string]interface{}) error {
	if c.conn == nil {
		return fmt.Errorf("not connected to server")
	}

	// Try multiple formats to find one that works
	// Format 1: Simple format with sessionId
	message1 := map[string]interface{}{
		"sessionId":  c.sessionID,
		"toolName":   toolName,
		"parameters": parameters,
	}

	// Format 2: MCP protocol format
	message2 := map[string]interface{}{
		"type":      "callTool",
		"sessionId": c.sessionID,
		"toolInput": map[string]interface{}{
			"name":       toolName,
			"parameters": parameters,
		},
	}

	// Try format 1 first
	fmt.Println("Trying request format 1...")
	data1, _ := json.Marshal(message1)
	fmt.Printf("Sending: %s\n", string(data1))
	err := c.conn.WriteMessage(websocket.TextMessage, data1)
	if err != nil {
		fmt.Printf("Error with format 1: %v\n", err)
		
		// Try format 2
		fmt.Println("Trying request format 2...")
		data2, _ := json.Marshal(message2)
		fmt.Printf("Sending: %s\n", string(data2))
		err = c.conn.WriteMessage(websocket.TextMessage, data2)
		if err != nil {
			return err
		}
	}

	fmt.Printf("Sent tool call: %s\n", toolName)
	return nil
}

// Listen for messages from the server
func (c *MCPClient) Listen() {
	done := make(chan struct{})

	// Handle incoming messages
	go func() {
		defer close(done)
		for {
			_, message, err := c.conn.ReadMessage()
			if err != nil {
				if websocket.IsCloseError(err, websocket.CloseNormalClosure) {
					fmt.Println("Connection closed normally")
				} else {
					fmt.Printf("Read error: %v\n", err)
				}
				return
			}
			
			// Pretty print the JSON message
			var prettyJSON bytes.Buffer
			err = json.Indent(&prettyJSON, message, "", "  ")
			if err != nil {
				fmt.Printf("Received: %s\n", message)
			} else {
				fmt.Printf("Received:\n%s\n", prettyJSON.String())
			}
		}
	}()

	// Handle interruption
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	select {
	case <-done:
		return
	case <-interrupt:
		fmt.Println("Interrupted, closing connection...")
		// Close the connection gracefully
		err := c.conn.WriteMessage(websocket.CloseMessage, 
			websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
		if err != nil {
			fmt.Printf("Write close error: %v\n", err)
			return
		}
		select {
		case <-done:
		case <-time.After(time.Second):
		}
		return
	}
}

func main() {
	// Available test phone numbers
	availablePhoneNumbers := []string{
		"1111111111", "2222222222", "3333333333", "4444444444", 
		"5555555555", "6666666666", "7777777777", "8888888888",
		"9999999999", "1010101010", "1212121212", "1313131313",
		"1414141414", "2020202020", "2121212121", "2525252525",
	}

	// Configure the client
	serverURL := "ws://localhost:8080/mcp/stream"
	sessionID := "my_session_123"
	phoneNumber := "1111111111"  // Choose one from the test data

	fmt.Println("Available test phone numbers:")
	for i, number := range availablePhoneNumbers {
		fmt.Printf("%d. %s\n", i+1, number)
	}

	// Validate the phone number
	valid := false
	for _, num := range availablePhoneNumbers {
		if num == phoneNumber {
			valid = true
			break
		}
	}

	if !valid {
		fmt.Printf("Warning: The phone number %s might not exist in the test data.\n", phoneNumber)
		fmt.Println("Consider using one of the available phone numbers instead.")
	}

	fmt.Printf("\nConnecting to server with sessionID: %s and phoneNumber: %s\n\n", sessionID, phoneNumber)

	fmt.Println("===========================================================================")
	fmt.Println("IMPORTANT: Before proceeding, you MUST authenticate in the browser!")
	fmt.Println("Please go to this URL in your browser and complete the login process:")
	fmt.Printf("http://localhost:8080/mockWebPage?sessionId=%s\n", sessionID)
	fmt.Println("Select the phone number:", phoneNumber)
	fmt.Println("===========================================================================")
	fmt.Println("Press Enter when you've completed the browser authentication...")
	
	// Wait for user to confirm they've authenticated in the browser
	bufio.NewReader(os.Stdin).ReadBytes('\n')

	// Create and initialize the client
	client, err := NewMCPClient(serverURL, sessionID, phoneNumber)
	if err != nil {
		log.Fatalf("Failed to initialize MCP client: %v", err)
	}
	defer client.Close()

	// Start listening for messages in a goroutine
	go client.Listen()

	// Simple command-line interface for making tool calls
	scanner := bufio.NewScanner(os.Stdin)
	fmt.Println("MCP Client Ready. Available commands:")
	fmt.Println("1. fetch_net_worth")
	fmt.Println("2. fetch_credit_report")
	fmt.Println("3. fetch_epf_details")
	fmt.Println("4. fetch_mf_transactions")
	fmt.Println("5. fetch_bank_transactions")
	fmt.Println("6. fetch_stock_transactions")
	fmt.Println("Type 'exit' to quit")

	for {
		fmt.Print("> ")
		if !scanner.Scan() {
			break
		}

		command := scanner.Text()
		if command == "exit" {
			break
		}

		switch command {
		case "1", "fetch_net_worth":
			client.CallTool("fetch_net_worth", map[string]interface{}{})
		case "2", "fetch_credit_report":
			client.CallTool("fetch_credit_report", map[string]interface{}{})
		case "3", "fetch_epf_details":
			client.CallTool("fetch_epf_details", map[string]interface{}{})
		case "4", "fetch_mf_transactions":
			client.CallTool("fetch_mf_transactions", map[string]interface{}{})
		case "5", "fetch_bank_transactions":
			client.CallTool("fetch_bank_transactions", map[string]interface{}{})
		case "6", "fetch_stock_transactions":
			client.CallTool("fetch_stock_transactions", map[string]interface{}{})
		default:
			fmt.Println("Unknown command")
		}
	}
}
