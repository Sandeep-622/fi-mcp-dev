package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
)

func main() {
	// Step 1: Log in first
	loginURL := "http://localhost:8080/login"
	formData := url.Values{
		"sessionId":   {"temp1"},
		"phoneNumber": {"1111111111"},
	}
	
	client := &http.Client{}
	req, err := http.NewRequest("POST", loginURL, strings.NewReader(formData.Encode()))
	if err != nil {
		fmt.Println("Error creating login request:", err)
		return
	}
	
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error sending login request:", err)
		return
	}
	resp.Body.Close()
	
	fmt.Println("Login completed with status:", resp.Status)

	// Step 2: Try different request formats to fetch net worth
	testFormats := []map[string]interface{}{
		// Format 1: Simple JSON
		{
			"sessionId":  "temp1",
			"toolName":   "fetch_net_worth",
			"parameters": map[string]interface{}{},
		},
		// Format 2: With type field
		{
			"type":       "callTool",
			"sessionId":  "temp1",
			"name":       "fetch_net_worth",
			"parameters": map[string]interface{}{},
		},
		// Format 3: Nested params
		{
			"sessionId": "temp1",
			"callToolRequest": map[string]interface{}{
				"toolName": "fetch_net_worth",
				"params":   map[string]interface{}{},
			},
		},
		// Format 4: Another possible format
		{
			"session_id":  "temp1",
			"tool_name":   "fetch_net_worth",
			"parameters":  map[string]interface{}{},
		},
		// Format 5: Using MCP protocol format
		{
			"type":      "callTool",
			"sessionId": "temp1", 
			"toolInput": map[string]interface{}{
				"name":       "fetch_net_worth",
				"parameters": map[string]interface{}{},
			},
		},
	}
	
	mcpURL := "http://localhost:8080/mcp/stream"
	
	for i, format := range testFormats {
		fmt.Printf("\n\nTesting format %d: %+v\n", i+1, format)
		
		jsonData, err := json.Marshal(format)
		if err != nil {
			fmt.Println("Error marshaling JSON:", err)
			continue
		}
		
		req, err := http.NewRequest("POST", mcpURL, bytes.NewBuffer(jsonData))
		if err != nil {
			fmt.Println("Error creating request:", err)
			continue
		}
		
		req.Header.Set("Content-Type", "application/json")
		
		resp, err := client.Do(req)
		if err != nil {
			fmt.Println("Error sending request:", err)
			continue
		}
		
		body, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			fmt.Println("Error reading response:", err)
			continue
		}
		
		fmt.Println("Status Code:", resp.Status)
		fmt.Println("Response Body:", string(body))
	}
}
