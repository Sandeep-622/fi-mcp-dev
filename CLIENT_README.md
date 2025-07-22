# Fi MCP Client

A simple client application for interacting with the Fi MCP server to access financial data.

## Overview

This client application authenticates with the Fi MCP server and allows you to retrieve financial data using a simple command-line interface. It's designed to work with the test data available in the `test_data_dir` directory.

## How to Use

### Step 1: Start the Fi MCP Server
```
go run main.go
```

### Step 2: Run the Enhanced Client
```
go run enhanced_client.go
```

### Step 3: Access Financial Data
Use the command-line interface to retrieve financial data:
- `1` or `fetch_net_worth` - Net worth analysis
- `2` or `fetch_credit_report` - Credit report with scores
- `3` or `fetch_epf_details` - EPF account information
- `4` or `fetch_mf_transactions` - Mutual fund transactions
- `5` or `fetch_bank_transactions` - Bank transaction history
- `6` or `fetch_stock_transactions` - Stock transaction history

Type `exit` to quit the application.

## Configuration

You can modify these parameters in the `main()` function of `enhanced_client.go`:

- `sessionID` - The session ID to use for authentication (default: "my_session_1234")
- `phoneNumber` - The phone number to use for authentication (default: "2222222222")

## Test Phone Numbers

Each phone number in `test_data_dir` represents a different financial scenario:

- `1111111111` - No assets connected, only saving account balance
- `2222222222` - All assets connected, large mutual fund portfolio
- `3333333333` - All assets connected, small mutual fund portfolio
- `4444444444` - Multiple assets with 2 UAN accounts and 3 different banks
- And many others (see client output for the full list)

## Implementation Details

This client:
1. Authenticates with the MCP server via HTTP
2. Directly reads financial data from the `test_data_dir` directory
3. Formats and displays the JSON data in a readable format
