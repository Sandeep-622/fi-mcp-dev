package main

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
)

func main() {
	// Step 1: Login first to authenticate the session
	err := login("temp1", "1111111111")
	if err != nil {
		log.Fatalf("Login failed: %v", err)
	}
	
	// Step 2: Try different approach - send POST request with correct headers
	sessionId := "temp1"
	
	// Try with different session ID approaches
	approaches := []struct {
		name    string
		url     string
		headers map[string]string
		body    string
	}{
		{
			name: "Query parameter",
			url:  fmt.Sprintf("http://localhost:8080/mcp/stream?sessionId=%s", sessionId),
			headers: map[string]string{
				"Content-Type": "application/json",
			},
			body: `{"type":"callTool","toolInput":{"name":"fetch_net_worth","parameters":{}}}`,
		},
		{
			name: "Custom header",
			url:  "http://localhost:8080/mcp/stream",
			headers: map[string]string{
				"Content-Type":  "application/json",
				"X-Session-ID":  sessionId,
				"Session-ID":    sessionId,
			},
			body: `{"type":"callTool","toolInput":{"name":"fetch_net_worth","parameters":{}}}`,
		},
		{
			name: "Cookie",
			url:  "http://localhost:8080/mcp/stream",
			headers: map[string]string{
				"Content-Type": "application/json",
				"Cookie":       fmt.Sprintf("sessionId=%s", sessionId),
			},
			body: `{"type":"callTool","toolInput":{"name":"fetch_net_worth","parameters":{}}}`,
		},
		{
			name: "Simple request body",
			url:  "http://localhost:8080/mcp/stream",
			headers: map[string]string{
				"Content-Type": "application/json",
			},
			body: fmt.Sprintf(`{"sessionId":"%s","toolName":"fetch_net_worth","parameters":{}}`, sessionId),
		},
	}
	
	// Try all approaches
	for _, approach := range approaches {
		fmt.Printf("\n\nTrying approach: %s\n", approach.name)
		
		req, err := http.NewRequest("POST", approach.url, bytes.NewBufferString(approach.body))
		if err != nil {
			log.Printf("Error creating request: %v", err)
			continue
		}
		
		// Set headers
		for k, v := range approach.headers {
			req.Header.Set(k, v)
		}
		
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			log.Printf("Error sending request: %v", err)
			continue
		}
		
		body, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			log.Printf("Error reading response: %v", err)
			continue
		}
		
		fmt.Printf("Status Code: %s\n", resp.Status)
		fmt.Printf("Response: %s\n", string(body))
	}
}

func login(sessionId, phoneNumber string) error {
	loginURL := "http://localhost:8080/login"
	formData := url.Values{
		"sessionId":   {sessionId},
		"phoneNumber": {phoneNumber},
	}
	
	client := &http.Client{}
	req, err := http.NewRequest("POST", loginURL, strings.NewReader(formData.Encode()))
	if err != nil {
		return fmt.Errorf("error creating login request: %w", err)
	}
	
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("error sending login request: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("login failed with status: %s", resp.Status)
	}
	
	log.Println("Login completed successfully")
	return nil
}
