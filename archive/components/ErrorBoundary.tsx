import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to your error reporting service
    console.error('React Component Error:', error);
    console.error('Error Info:', errorInfo);
  }

  private handleReload = () => {
    // Reset the error state
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      // Render error UI
      return <ErrorFallback onReload={this.handleReload} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

type ErrorFallbackProps = {
  onReload: () => void;
};

function ErrorFallback({ onReload }: ErrorFallbackProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={64}
        color={colors.primary}
        style={styles.icon}
      />
      <Text style={[styles.title, { color: colors.text }]}>
        Oops, Something Went Wrong
      </Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>
        We're working on fixing this!
      </Text>
      <Pressable
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onReload}
      >
        <MaterialCommunityIcons
          name="refresh"
          size={20}
          color="#fff"
          style={styles.buttonIcon}
        />
        <Text style={styles.buttonText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 