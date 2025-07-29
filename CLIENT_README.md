# Fi MCP Client

A client application for interacting with the Fi MCP server to access financial data, with multiple interface options.

## Overview

This client application authenticates with the Fi MCP server and allows you to retrieve financial data using either a command-line interface or a modern React-based web interface. It's designed to work with the test data available in the `test_data_dir` directory.

## Command-Line Interface

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

## React Chat Interface

The React frontend provides a modern chat interface similar to popular AI assistants.

### Running the Full Application

Use the provided scripts to build and run the entire application (React frontend + Go backend):

```
# On Windows
run_app.bat

# On macOS/Linux
chmod +x run_app.sh
./run_app.sh
```

This will:
1. Install React dependencies
2. Build the React frontend
3. Start the Go server

### Development Setup

For frontend development:

```
cd frontend
npm install
npm run dev
```

This starts the Vite development server (typically on port 5173) and proxies API requests to the Go backend on port 8080.

### Accessing the Chat Interface

Once running, open your web browser and navigate to:
```
http://localhost:8080
```

### Features of the React Interface
- Modern chat interface similar to popular AI assistants
- Light and dark mode support
- Mobile-friendly responsive design
- Chat history persistence
- Markdown support for rich text formatting

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
