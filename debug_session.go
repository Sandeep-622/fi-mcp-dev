package main

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

func main() {
	// Check command line arguments
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run debug_session.go [check|login]")
		fmt.Println("  check <sessionId> - Check if a session ID is valid")
		fmt.Println("  login <sessionId> <phoneNumber> - Create a new session")
		return
	}

	command := os.Args[1]
	baseURL := "http://localhost:8080"

	switch command {
	case "check":
		if len(os.Args) < 3 {
			fmt.Println("Error: Session ID required for check command")
			return
		}
		sessionID := os.Args[2]
		checkSession(baseURL, sessionID)

	case "login":
		if len(os.Args) < 4 {
			fmt.Println("Error: Session ID and phone number required for login command")
			return
		}
		sessionID := os.Args[2]
		phoneNumber := os.Args[3]
		createSession(baseURL, sessionID, phoneNumber)

	default:
		fmt.Println("Unknown command:", command)
	}
}

func checkSession(baseURL, sessionID string) {
	fmt.Printf("Checking session ID: %s\n", sessionID)
	
	// Use the specific session check endpoint
	client := &http.Client{
		Timeout: 5 * time.Second,
	}
	checkURL := fmt.Sprintf("%s/check-session?sessionId=%s", baseURL, sessionID)
	
	fmt.Printf("Checking URL: %s\n", checkURL)
	
	req, err := http.NewRequest("GET", checkURL, nil)
	if err != nil {
		fmt.Printf("Error creating request: %v\n", err)
		return
	}
	
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error sending request: %v\n", err)
		return
	}
	defer resp.Body.Close()
	
	fmt.Printf("Status: %s\n", resp.Status)
	
	// Read the response body
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response body: %v\n", err)
		return
	}
	responseBody := string(bodyBytes)
	
	fmt.Printf("Response: %s\n", responseBody)
	
	// Check the status code
	if resp.StatusCode == http.StatusOK {
		fmt.Println("Session is valid!")
	} else {
		fmt.Println("Session is invalid or expired")
	}
	
	if strings.Contains(responseBody, "login_required") {
		fmt.Println("Session is invalid - login required")
	} else if resp.StatusCode == 200 {
		fmt.Println("Session appears to be valid!")
	} else {
		fmt.Println("Session appears to be invalid or expired")
	}
}

func createSession(baseURL, sessionID, phoneNumber string) {
	fmt.Printf("Creating session with ID: %s and phone number: %s\n", sessionID, phoneNumber)
	
	// Send login request
	client := &http.Client{}
	loginURL := fmt.Sprintf("%s/login", baseURL)
	formData := url.Values{
		"sessionId":   {sessionID},
		"phoneNumber": {phoneNumber},
	}
	
	req, err := http.NewRequest("POST", loginURL, strings.NewReader(formData.Encode()))
	if err != nil {
		fmt.Printf("Error creating request: %v\n", err)
		return
	}
	
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error sending request: %v\n", err)
		return
	}
	defer resp.Body.Close()
	
	fmt.Printf("Status: %s\n", resp.Status)
	
	if resp.StatusCode == 200 {
		fmt.Println("Session created successfully!")
	} else {
		fmt.Println("Failed to create session")
	}
}
