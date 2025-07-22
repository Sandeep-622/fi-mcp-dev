# Fi MCP Client Applications

This repository contains several client applications for interacting with the Fi MCP server. Each client demonstrates different approaches to retrieving financial data.

## Available Clients

1. **WebSocket MCP Client** (`mcp_client.go`) - Implements the Model Context Protocol using WebSockets (Note: WebSocket connection may not be supported by the server)

2. **Enhanced HTTP Client** (`enhanced_client.go`) - **RECOMMENDED** - Uses HTTP for authentication and directly reads data files

3. **Simple Client** (`simple_client.go`) - A minimal version that reads data directly from test data files

## Recommended Approach: Enhanced HTTP Client

For the most reliable experience, we recommend using the Enhanced HTTP Client:

```
go run enhanced_client.go
```

This client:
- Authenticates with the server via HTTP
- Provides a simple command-line interface
- Reads the test data directly for tool calls
- Does not require browser authentication

## Other Approaches

### WebSocket MCP Client (Not Recommended)
The WebSocket approach (`mcp_client.go`) attempts to implement the full Model Context Protocol, but the server may not support WebSocket connections correctly.

If you want to try it:
1. Authenticate in the browser: `http://localhost:8080/mockWebPage?sessionId=my_session_123`
2. Run the client: `go run mcp_client.go`

### Simple Client
The Simple Client (`simple_client.go`) is a minimal implementation that:
- Authenticates via HTTP
- Reads data directly from test data files
- Does not use WebSockets

Run it with: `go run simple_client.go`

## Available Tools

All clients support these tools:
1. `fetch_net_worth` - Net worth analysis
2. `fetch_credit_report` - Credit report with scores
3. `fetch_epf_details` - EPF account information
4. `fetch_mf_transactions` - Mutual fund transactions
5. `fetch_bank_transactions` - Bank transaction history
6. `fetch_stock_transactions` - Stock transaction history

## Test Phone Numbers

You can test different financial scenarios using these phone numbers:
- `1111111111` - No assets connected
- `2222222222` - All assets connected, large mutual fund portfolio
- `3333333333` - All assets connected, small mutual fund portfolio
- And many more (see client output for the full list)

## Available Tools

1. `fetch_net_worth` - Retrieves comprehensive net worth analysis
2. `fetch_credit_report` - Retrieves credit report with scores and loan details
3. `fetch_epf_details` - Retrieves detailed EPF (Employee Provident Fund) information
4. `fetch_mf_transactions` - Retrieves mutual fund transaction history
5. `fetch_bank_transactions` - Retrieves bank transaction history
6. `fetch_stock_transactions` - Retrieves stock transaction history

## How to Use

1. Make sure the Fi MCP server is running (e.g., `go run main.go`)
2. Run the MCP client: `go run mcp_client.go`
3. The client will authenticate with the server using the configured session ID and phone number
4. Once connected, use the command-line interface to make tool calls
5. Type the tool number or name (e.g., `1` or `fetch_net_worth`) to make a call
6. Type `exit` to quit the application

## Configuration

You can modify the following parameters in the `main()` function:

- `serverURL`: The WebSocket URL of the MCP server (default: `ws://localhost:8080/mcp/stream`)
- `sessionID`: The session ID to use for authentication (default: `my_session_123`)
- `phoneNumber`: The phone number to use for authentication (default: `1111111111`)

## Technical Details

The client implements the Model Context Protocol for communicating with the server:

1. **Authentication**: Uses HTTP POST to the `/login` endpoint
2. **Connection**: Establishes a WebSocket connection to the `/mcp/stream` endpoint
3. **Tool Calls**: Sends JSON messages with the format:
   ```json
   {
     "type": "callTool",
     "toolInput": {
       "name": "tool_name",
       "parameters": {}
     }
   }
   ```
4. **Responses**: Listens for and displays responses from the server

## Testing Different Scenarios

The test data includes various phone numbers representing different financial scenarios:

| Phone Number | Description |
|-------------|-------------|
| 1111111111 | No assets connected, only saving account balance |
| 2222222222 | All assets connected, large mutual fund portfolio |
| 3333333333 | All assets connected, small mutual fund portfolio |
| ... | ... |

To test different scenarios, change the `phoneNumber` parameter in the `main()` function.
