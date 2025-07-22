package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
)

// HttpClient represents a simple HTTP client for interacting with the server
type HttpClient struct {
	serverBaseURL string
	sessionID     string
	phoneNumber   string
	httpClient    *http.Client
}

// Initialize the HTTP client and authenticate
func NewHttpClient(serverBaseURL, sessionID, phoneNumber string) (*HttpClient, error) {
	client := &HttpClient{
		serverBaseURL: serverBaseURL,
		sessionID:     sessionID,
		phoneNumber:   phoneNumber,
		httpClient:    &http.Client{},
	}

	// Authenticate the session
	err := client.authenticate()
	if err != nil {
		return nil, fmt.Errorf("authentication failed: %w", err)
	}

	return client, nil
}

// Authenticate the session with the server
func (c *HttpClient) authenticate() error {
	// First, we need to visit the mockWebPage endpoint to get the login form
	mockURL := fmt.Sprintf("%s/mockWebPage?sessionId=%s", c.serverBaseURL, c.sessionID)
	
	fmt.Printf("Accessing mock web page at: %s\n", mockURL)
	_, err := c.httpClient.Get(mockURL)
	if err != nil {
		return fmt.Errorf("failed to access mock web page: %w", err)
	}
	
	// Now perform the actual login
	loginURL := fmt.Sprintf("%s/login", c.serverBaseURL)
	formData := url.Values{
		"sessionId":   {c.sessionID},
		"phoneNumber": {c.phoneNumber},
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

// Call a tool on the server
func (c *HttpClient) CallTool(toolName string) error {
	// First, let's try to access the test_data_dir directly as a simpler approach
	dataPath := fmt.Sprintf("%s/test_data_dir/%s/%s.json", 
		c.serverBaseURL, c.phoneNumber, toolName)
	
	fmt.Printf("Trying to access data directly at: %s\n", dataPath)
	resp, err := c.httpClient.Get(dataPath)
	if err == nil && resp.StatusCode == http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		fmt.Printf("\nResult for %s:\n", toolName)
		prettyPrintJSON(body)
		return nil
	}
	
	if resp != nil {
		resp.Body.Close()
	}
	
	// If direct access doesn't work, try through the API
	fmt.Println("Direct access didn't work, trying through API...")
	
	// We'll try two different formats for the request
	formats := []map[string]interface{}{
		// Format 1
		{
			"sessionId":  c.sessionID,
			"toolName":   toolName,
			"parameters": map[string]interface{}{},
		},
		// Format 2
		{
			"type":      "callTool",
			"sessionId": c.sessionID,
			"toolInput": map[string]interface{}{
				"name":       toolName,
				"parameters": map[string]interface{}{},
			},
		},
	}
	
	for i, format := range formats {
		fmt.Printf("Trying format %d...\n", i+1)
		jsonData, err := json.Marshal(format)
		if err != nil {
			continue
		}
		
		apiURL := fmt.Sprintf("%s/mcp/stream?sessionId=%s", c.serverBaseURL, c.sessionID)
		req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
		if err != nil {
			continue
		}
		
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Session-ID", c.sessionID)
		
		resp, err := c.httpClient.Do(req)
		if err != nil {
			fmt.Printf("Error with format %d: %v\n", i+1, err)
			continue
		}
		
		body, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			fmt.Printf("Error reading response: %v\n", err)
			continue
		}
		
		fmt.Printf("Response status: %s\n", resp.Status)
		if resp.StatusCode == http.StatusOK {
			fmt.Printf("\nResult for %s:\n", toolName)
			prettyPrintJSON(body)
			return nil
		} else {
			fmt.Printf("Response body: %s\n", string(body))
		}
	}
	
	return fmt.Errorf("failed to call tool %s with all formats", toolName)
}

// Pretty print JSON
func prettyPrintJSON(data []byte) {
	var prettyJSON bytes.Buffer
	err := json.Indent(&prettyJSON, data, "", "  ")
	if err != nil {
		fmt.Printf("%s\n", string(data))
	} else {
		fmt.Printf("%s\n", prettyJSON.String())
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
	serverBaseURL := "http://localhost:8080"
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

	// Create and initialize the client
	client, err := NewHttpClient(serverBaseURL, sessionID, phoneNumber)
	if err != nil {
		log.Fatalf("Failed to initialize HTTP client: %v", err)
	}

	// Simple command-line interface for making tool calls
	scanner := bufio.NewScanner(os.Stdin)
	fmt.Println("HTTP Client Ready. Available commands:")
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

		var toolName string
		switch command {
		case "1", "fetch_net_worth":
			toolName = "fetch_net_worth"
		case "2", "fetch_credit_report":
			toolName = "fetch_credit_report"
		case "3", "fetch_epf_details":
			toolName = "fetch_epf_details"
		case "4", "fetch_mf_transactions":
			toolName = "fetch_mf_transactions"
		case "5", "fetch_bank_transactions":
			toolName = "fetch_bank_transactions"
		case "6", "fetch_stock_transactions":
			toolName = "fetch_stock_transactions"
		default:
			fmt.Println("Unknown command")
			continue
		}

		err := client.CallTool(toolName)
		if err != nil {
			fmt.Printf("Error: %v\n", err)
		}
	}
}
