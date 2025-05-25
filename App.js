import React from 'react';
import { LogBox } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import AppNavigator from './src/AppNavigator';

// ✅ Tắt toàn bộ cảnh báo (YellowBox/LogBox)
LogBox.ignoreAllLogs(); // 👈 Thêm dòng này tại đây

const App = () => {
  return (
    <StripeProvider
      publishableKey="pk_test_51RLmoMPF810tDnTFvyns49SqDsjZ7IWYn5ByXHrH20ixCIPmWrLYRejbdYOJezG0ghWIQQlgB8mUT89GQiAc0GcH00GuuOAEJX"
      merchantIdentifier="merchant.com.foodapp"
    >
      <AppNavigator />
    </StripeProvider>
  );
};

export default App;
