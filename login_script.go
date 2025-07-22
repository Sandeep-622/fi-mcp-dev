package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
)

func main() {
	// The URL for the login
	loginURL := "http://localhost:8080/login"
	
	// Form data
	formData := url.Values{
		"sessionId":   {"temp1"},
		"phoneNumber": {"1111111111"},
	}
	
	// Create the HTTP client and request
	client := &http.Client{}
	req, err := http.NewRequest("POST", loginURL, strings.NewReader(formData.Encode()))
	if err != nil {
		fmt.Println("Error creating request:", err)
		return
	}
	
	// Set headers
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	
	// Send the request
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error sending request:", err)
		return
	}
	defer resp.Body.Close()
	
	// Read and print response
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response:", err)
		return
	}
	
	fmt.Println("Status Code:", resp.Status)
	fmt.Println("Response Body:", string(body))
	
	fmt.Println("\nNow try making your API call to /mcp/stream with sessionId 'temp1'")
}
