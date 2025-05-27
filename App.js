import React from 'react';
import { LogBox } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import AppNavigator from './src/AppNavigator';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

LogBox.ignoreAllLogs();

// 🧩 Custom Toast config với font chữ to hơn
const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      text1Style={{ fontSize: 18, fontWeight: 'bold' }}
      text2Style={{ fontSize: 16 }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{ fontSize: 18, fontWeight: 'bold' }}
      text2Style={{ fontSize: 16 }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#1976D2' }}
      text1Style={{ fontSize: 18, fontWeight: 'bold' }}
      text2Style={{ fontSize: 16 }}
    />
  ),
};

const App = () => {
  return (
    <>
      <StripeProvider
        publishableKey="pk_test_51RLmoMPF810tDnTFvyns49SqDsjZ7IWYn5ByXHrH20ixCIPmWrLYRejbdYOJezG0ghWIQQlgB8mUT89GQiAc0GcH00GuuOAEJX"
        merchantIdentifier="merchant.com.foodapp"
      >
        <AppNavigator />
      </StripeProvider>
      
      {/* 🔔 Thêm Toast với custom config */}
      <Toast config={toastConfig} />
    </>
  );
};

export default App;
