package main

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
)

func main() {
	// Step 1: Login first to authenticate the session
	loginURL := "http://localhost:8080/login"
	formData := url.Values{
		"sessionId":   {"temp1"},
		"phoneNumber": {"1111111111"},
	}
	
	client := &http.Client{}
	req, err := http.NewRequest("POST", loginURL, strings.NewReader(formData.Encode()))
	if err != nil {
		log.Fatalf("Error creating login request: %v", err)
	}
	
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Error sending login request: %v", err)
	}
	defer resp.Body.Close()
	
	fmt.Println("Login completed with status:", resp.Status)
	fmt.Println("\nTo test the MCP server properly, you need to:")
	fmt.Println("1. Use an MCP-compatible client that can connect to ws://localhost:8080/mcp/stream")
	fmt.Println("2. Pass the same session ID ('temp1') in the client configuration")
	fmt.Println("3. Call the tools like 'fetch_net_worth' through the client")
	fmt.Println("\nThis server is designed for Model Context Protocol clients, not direct HTTP API calls.")
	fmt.Println("For testing purposes, you could modify the main.go to add a simple test endpoint.")
}
