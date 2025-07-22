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
	"strings"
	"time"
)

// MCPClient represents a client for the Model Context Protocol
type MCPClient struct {
	serverURL  string
	sessionID  string
	phoneNumber string
	httpClient *http.Client
}

// Initialize the MCP client
func NewMCPClient(serverURL, sessionID, phoneNumber string) *MCPClient {
	return &MCPClient{
		serverURL:   serverURL,
		sessionID:   sessionID,
		phoneNumber: phoneNumber,
		httpClient:  &http.Client{},
	}
}

// Authenticate the session with the server
func (c *MCPClient) Authenticate() error {
	loginURL := fmt.Sprintf("http://%s/login", strings.TrimPrefix(c.serverURL, "http://"))
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

// Call a tool on the MCP server directly (bypassing the MCP protocol)
func (c *MCPClient) CallTool(toolName string) error {
	// For simplicity, we'll directly read the tool data from the test data directory
	filePath := fmt.Sprintf("test_data_dir/%s/%s.json", c.phoneNumber, toolName)
	
	fmt.Printf("Reading tool data from: %s\n", filePath)
	
	data, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("error reading file %s: %v", filePath, err)
	}
	
	// Pretty print the JSON
	var prettyJSON bytes.Buffer
	err = json.Indent(&prettyJSON, data, "", "  ")
	if err != nil {
		fmt.Printf("Response:\n%s\n", string(data))
	} else {
		fmt.Printf("Response:\n%s\n", prettyJSON.String())
	}
	
	return nil
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
	baseURL := "http://localhost:8080"
	sessionID := "new_session_" + fmt.Sprintf("%d", time.Now().Unix())  // Use a timestamp to ensure uniqueness
	phoneNumber := "1111111111"  // Choose one from the test data

	fmt.Println("==============================================")
	fmt.Println("Fi MCP Enhanced Client")
	fmt.Println("==============================================")

	fmt.Println("\nAvailable test phone numbers:")
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

	// Create client and authenticate
	client := NewMCPClient(baseURL, sessionID, phoneNumber)
	err := client.Authenticate()
	if err != nil {
		log.Fatalf("Authentication failed: %v", err)
	}

	// Simple command-line interface for making tool calls
	scanner := bufio.NewScanner(os.Stdin)
	fmt.Println("\nMCP Client Ready. Available commands:")
	fmt.Println("1. fetch_net_worth")
	fmt.Println("2. fetch_credit_report")
	fmt.Println("3. fetch_epf_details")
	fmt.Println("4. fetch_mf_transactions")
	fmt.Println("5. fetch_bank_transactions")
	fmt.Println("6. fetch_stock_transactions")
	fmt.Println("Type 'exit' to quit")

	for {
		fmt.Print("\n> ")
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
