import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Container, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    
    // You can log the error to an error reporting service here
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" color="error" gutterBottom>
                Something went wrong
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We apologize for the inconvenience. Please try refreshing the page or navigate back to the homepage.
              </Typography>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  component={Link} 
                  to="/"
                >
                  Go to Homepage
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </Box>
            </Box>
            
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, overflow: 'auto' }}>
                <Typography variant="subtitle2" color="error">
                  {this.state.error?.toString()}
                </Typography>
                <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', mt: 2 }}>
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;