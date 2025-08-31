import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  useMediaQuery,
  Theme,
} from '@mui/material';
import { ShoppingCart, LocalShipping, Payment, Check } from '@mui/icons-material';

import AddressForm from './AddressForm';
import PaymentMethodSelector from './PaymentMethodSelector';
import OrderSummary from './OrderSummary';
import ShippingMethodSelector from './ShippingMethodSelector';

// Payment method types
export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'paypal' 
  | 'mercado_pago' 
  | 'oxxo' 
  | 'bank_transfer' 
  | 'installments';

// Shipping method types
export type ShippingMethod = 
  | 'standard' 
  | 'express' 
  | 'same_day' 
  | 'pickup_point' 
  | 'store_pickup';

interface OneStepCheckoutProps {
  cartItems: any[];
  onCompleteOrder: (orderData: any) => Promise<void>;
}

/**
 * One-step checkout component that shows all checkout sections on a single page
 * but maintains a visual stepper for progress indication
 */
const OneStepCheckout: React.FC<OneStepCheckoutProps> = ({
  cartItems,
  onCompleteOrder,
}) => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  
  // State for the active step (for visual indication only)
  const [activeStep, setActiveStep] = useState(0);
  
  // Form data states
  const [addressData, setAddressData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'MX',
  });
  
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod>('standard');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [paymentDetails, setPaymentDetails] = useState({});
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  
  // Steps for the stepper
  const steps = [
    { label: 'Dirección de envío', icon: <LocalShipping /> },
    { label: 'Método de envío', icon: <LocalShipping /> },
    { label: 'Método de pago', icon: <Payment /> },
    { label: 'Revisar y confirmar', icon: <Check /> },
  ];
  
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Combine all checkout data
      const orderData = {
        customer: {
          firstName: addressData.firstName,
          lastName: addressData.lastName,
          email: addressData.email,
          phone: addressData.phone,
        },
        shippingAddress: {
          address1: addressData.address1,
          address2: addressData.address2,
          city: addressData.city,
          state: addressData.state,
          postalCode: addressData.postalCode,
          country: addressData.country,
        },
        shippingMethod: selectedShippingMethod,
        paymentMethod: selectedPaymentMethod,
        paymentDetails,
        items: cartItems,
      };
      
      // Submit order
      await onCompleteOrder(orderData);
      
      // Update UI
      setActiveStep(4);
      setOrderComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if the form is valid and can be submitted
  const isFormValid = () => {
    // Basic validation
    const requiredAddressFields = [
      'firstName', 'lastName', 'email', 'phone', 
      'address1', 'city', 'state', 'postalCode'
    ];
    
    const addressValid = requiredAddressFields.every(field => 
      addressData[field as keyof typeof addressData]?.trim()
    );
    
    return addressValid && selectedShippingMethod && selectedPaymentMethod;
  };
  
  // Handle step navigation (for visual indication only)
  const handleStepClick = (step: number) => {
    if (step <= 3) {
      setActiveStep(step);
    }
  };
  
  // If order is complete, show success message
  if (orderComplete) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h4" gutterBottom>
          ¡Gracias por tu compra!
        </Typography>
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
          <Check color="success" sx={{ fontSize: 80 }} />
        </Box>
        <Typography variant="body1" paragraph>
          Tu pedido ha sido procesado correctamente.
        </Typography>
        <Typography variant="body1" paragraph>
          Hemos enviado un correo electrónico de confirmación a {addressData.email}.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          href="/account/orders"
          sx={{ mt: 2 }}
        >
          Ver mis pedidos
        </Button>
      </Box>
    );
  }
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 8 }}>
      {/* Progress stepper */}
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel={!isMobile}
        orientation={isMobile ? 'vertical' : 'horizontal'}
        sx={{ mb: 4 }}
      >
        {steps.map((step, index) => (
          <Step key={step.label} completed={activeStep > index}>
            <StepLabel 
              StepIconProps={{ 
                icon: step.icon 
              }}
              onClick={() => handleStepClick(index)}
              sx={{ cursor: 'pointer' }}
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        {/* Left column: Forms */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dirección de envío
            </Typography>
            <AddressForm 
              addressData={addressData}
              setAddressData={setAddressData}
            />
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Método de envío
            </Typography>
            <ShippingMethodSelector
              selectedMethod={selectedShippingMethod}
              onSelectMethod={setSelectedShippingMethod}
            />
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Método de pago
            </Typography>
            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onSelectMethod={setSelectedPaymentMethod}
              onPaymentDetailsChange={setPaymentDetails}
            />
          </Paper>
        </Grid>
        
        {/* Right column: Order summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Typography variant="h6" gutterBottom>
              Resumen del pedido
            </Typography>
            <OrderSummary 
              items={cartItems}
              shippingMethod={selectedShippingMethod}
            />
            <Divider sx={{ my: 2 }} />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={isSubmitting || !isFormValid()}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ShoppingCart />}
            >
              {isSubmitting ? 'Procesando...' : 'Completar compra'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OneStepCheckout;