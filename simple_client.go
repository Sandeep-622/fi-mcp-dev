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
)

// Simple MCP client that uses HTTP login and direct data fetching
func main() {
	// Available phone numbers from test data
	availablePhoneNumbers := []string{
		"1111111111", "2222222222", "3333333333", "4444444444", 
		"5555555555", "6666666666", "7777777777", "8888888888",
		"9999999999", "1010101010", "1212121212", "1313131313",
		"1414141414", "2020202020", "2121212121", "2525252525",
	}

	// Configuration
	sessionID := "simple_session_123"
	phoneNumber := "1111111111"  // Choose one from the test data

	fmt.Println("==============================================")
	fmt.Println("Fi MCP Simple Client")
	fmt.Println("==============================================")
	
	fmt.Println("\nAvailable test phone numbers:")
	for i, number := range availablePhoneNumbers {
		fmt.Printf("%d. %s\n", i+1, number)
	}

	// Authenticate with the server
	fmt.Printf("\nLogging in with sessionID: %s and phoneNumber: %s\n", sessionID, phoneNumber)
	err := login(sessionID, phoneNumber)
	if err != nil {
		log.Fatalf("Login failed: %v", err)
	}
	fmt.Println("Login successful!")

	// Command line interface
	scanner := bufio.NewScanner(os.Stdin)
	fmt.Println("\nAvailable commands:")
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

		// Fetch data directly from the test data directory
		data, err := fetchData(phoneNumber, toolName)
		if err != nil {
			fmt.Printf("Error: %v\n", err)
			continue
		}

		// Pretty print the JSON
		var prettyJSON bytes.Buffer
		err = json.Indent(&prettyJSON, []byte(data), "", "  ")
		if err != nil {
			fmt.Printf("Response: %s\n", data)
		} else {
			fmt.Printf("Response:\n%s\n", prettyJSON.String())
		}
	}
}

// Login to the server
func login(sessionID, phoneNumber string) error {
	loginURL := "http://localhost:8080/login"
	formData := url.Values{
		"sessionId":   {sessionID},
		"phoneNumber": {phoneNumber},
	}

	client := &http.Client{}
	req, err := http.NewRequest("POST", loginURL, strings.NewReader(formData.Encode()))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("login failed with status code: %d", resp.StatusCode)
	}

	return nil
}

// Fetch data directly from the test data directory (simplified approach)
func fetchData(phoneNumber, toolName string) (string, error) {
	// This is a simplified version that directly reads the test data file
	// In a real application, you would make HTTP requests to the server
	filePath := fmt.Sprintf("test_data_dir/%s/%s.json", phoneNumber, toolName)
	
	data, err := os.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("error reading file %s: %v", filePath, err)
	}
	
	return string(data), nil
}
