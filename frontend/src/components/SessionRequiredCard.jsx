import { Card, CardContent, Typography, Button } from '@mui/material';

export default function SessionRequiredCard({ onAuthenticate }) {
  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 6, boxShadow: 4, borderRadius: 3 }}>
      <CardContent sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h6" gutterBottom color="primary">
          Authentication Required
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Please login with Fi MCP to access the chat assistant and your personalized financial data.
        </Typography>
        <Button variant="contained" color="primary" size="large" onClick={onAuthenticate}>
          Authenticate with Fi MCP
        </Button>
      </CardContent>
    </Card>
  );
}
