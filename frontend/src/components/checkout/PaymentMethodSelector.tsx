import React, { useState } from 'react';
import {
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
  Divider,
  Paper,
  TextField,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormHelperText,
  Collapse,
  Alert,
} from '@mui/material';
import {
  CreditCard,
  AccountBalance,
  Store,
  PaymentOutlined,
  CalendarToday,
} from '@mui/icons-material';
import { PaymentMethod } from './OneStepCheckout';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  onPaymentDetailsChange: (details: any) => void;
}

/**
 * Component for selecting and configuring payment methods
 */
const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  onPaymentDetailsChange,
}) => {
  // Credit card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Installments state
  const [installments, setInstallments] = useState('1');
  
  // Handle payment method change
  const handleMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelectMethod(event.target.value as PaymentMethod);
  };
  
  // Update payment details when form changes
  React.useEffect(() => {
    if (selectedMethod === 'credit_card' || selectedMethod === 'debit_card') {
      onPaymentDetailsChange({
        cardNumber,
        cardName,
        expiryMonth,
        expiryYear,
        cvv,
        installments: selectedMethod === 'installments' ? installments : '1',
      });
    } else if (selectedMethod === 'installments') {
      onPaymentDetailsChange({
        cardNumber,
        cardName,
        expiryMonth,
        expiryYear,
        cvv,
        installments,
      });
    } else if (selectedMethod === 'oxxo') {
      onPaymentDetailsChange({
        paymentType: 'oxxo',
      });
    } else if (selectedMethod === 'bank_transfer') {
      onPaymentDetailsChange({
        paymentType: 'bank_transfer',
      });
    } else {
      onPaymentDetailsChange({
        paymentType: selectedMethod,
      });
    }
  }, [
    selectedMethod,
    cardNumber,
    cardName,
    expiryMonth,
    expiryYear,
    cvv,
    installments,
    onPaymentDetailsChange,
  ]);
  
  // Generate year options for expiry date
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear + i);
  
  // Generate month options for expiry date
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate installment options
  const installmentOptions = [1, 3, 6, 9, 12, 18, 24];
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim();
  };
  
  // Render credit/debit card form
  const renderCardForm = () => (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Número de tarjeta"
            fullWidth
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            inputProps={{ maxLength: 19 }}
            placeholder="1234 5678 9012 3456"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Nombre en la tarjeta"
            fullWidth
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="NOMBRE APELLIDO"
            required
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required>
            <InputLabel>Mes</InputLabel>
            <Select
              value={expiryMonth}
              onChange={(e) => setExpiryMonth(e.target.value)}
              label="Mes"
            >
              {monthOptions.map((month) => (
                <MenuItem key={month} value={month.toString().padStart(2, '0')}>
                  {month.toString().padStart(2, '0')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required>
            <InputLabel>Año</InputLabel>
            <Select
              value={expiryYear}
              onChange={(e) => setExpiryYear(e.target.value)}
              label="Año"
            >
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year.toString()}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="CVV"
            fullWidth
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            inputProps={{ maxLength: 4 }}
            required
          />
        </Grid>
      </Grid>
    </Box>
  );
  
  // Render installments form
  const renderInstallmentsForm = () => (
    <Box sx={{ mt: 2 }}>
      {renderCardForm()}
      <Box sx={{ mt: 2 }}>
        <FormControl fullWidth required>
          <InputLabel>Meses sin intereses</InputLabel>
          <Select
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
            label="Meses sin intereses"
          >
            {installmentOptions.map((months) => (
              <MenuItem key={months} value={months.toString()}>
                {months === 1 ? 'Pago único' : `${months} meses`}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {installments !== '1' && (
              <>
                {`${installments} pagos de $${(1000 / parseInt(installments)).toFixed(2)} MXN`}
              </>
            )}
          </FormHelperText>
        </FormControl>
      </Box>
    </Box>
  );
  
  // Render OXXO payment instructions
  const renderOxxoInstructions = () => (
    <Box sx={{ mt: 2 }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        Al finalizar tu compra, recibirás un código de pago que podrás utilizar en cualquier tienda OXXO.
      </Alert>
      <Typography variant="body2" color="text.secondary" paragraph>
        1. Finaliza tu compra y obtén tu código de pago.
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        2. Acude a tu tienda OXXO más cercana.
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        3. Indica en caja que quieres realizar un pago de servicio.
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        4. Proporciona el código de pago al cajero.
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        5. Realiza el pago en efectivo.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        6. Recibirás un correo de confirmación cuando tu pago sea procesado.
      </Typography>
    </Box>
  );
  
  // Render bank transfer instructions
  const renderBankTransferInstructions = () => (
    <Box sx={{ mt: 2 }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        Al finalizar tu compra, recibirás los datos bancarios para realizar la transferencia.
      </Alert>
      <Typography variant="body2" color="text.secondary" paragraph>
        1. Finaliza tu compra y obtén los datos bancarios.
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        2. Realiza la transferencia desde tu banca en línea o aplicación móvil.
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        3. Incluye el número de referencia en el concepto de la transferencia.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        4. Recibirás un correo de confirmación cuando tu pago sea procesado.
      </Typography>
    </Box>
  );
  
  return (
    <FormControl component="fieldset" fullWidth>
      <RadioGroup
        aria-label="payment-method"
        name="payment-method"
        value={selectedMethod}
        onChange={handleMethodChange}
      >
        <Grid container spacing={2}>
          {/* Credit Card */}
          <Grid item xs={12} sm={6}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                border: selectedMethod === 'credit_card' ? 2 : 1,
                borderColor: selectedMethod === 'credit_card' ? 'primary.main' : 'divider',
              }}
            >
              <FormControlLabel
                value="credit_card"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CreditCard sx={{ mr: 1 }} />
                    <Typography>Tarjeta de crédito</Typography>
                  </Box>
                }
                sx={{ width: '100%' }}
              />
              <Collapse in={selectedMethod === 'credit_card'}>
                {renderCardForm()}
              </Collapse>
            </Paper>
          </Grid>
          
          {/* Debit Card */}
          <Grid item xs={12} sm={6}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                border: selectedMethod === 'debit_card' ? 2 : 1,
                borderColor: selectedMethod === 'debit_card' ? 'primary.main' : 'divider',
              }}
            >
              <FormControlLabel
                value="debit_card"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CreditCard sx={{ mr: 1 }} />
                    <Typography>Tarjeta de débito</Typography>
                  </Box>
                }
                sx={{ width: '100%' }}
              />
              <Collapse in={selectedMethod === 'debit_card'}>
                {renderCardForm()}
              </Collapse>
            </Paper>
          </Grid>
          
          {/* Installments */}
          <Grid item xs={12} sm={6}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                border: selectedMethod === 'installments' ? 2 : 1,
                borderColor: selectedMethod === 'installments' ? 'primary.main' : 'divider',
              }}
            >
              <FormControlLabel
                value="installments"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ mr: 1 }} />
                    <Typography>Meses sin intereses</Typography>
                  </Box>
                }
                sx={{ width: '100%' }}
              />
              <Collapse in={selectedMethod === 'installments'}>
                {renderInstallmentsForm()}
              </Collapse>
            </Paper>
          </Grid>
          
          {/* PayPal */}
          <Grid item xs={12} sm={6}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                border: selectedMethod === 'paypal' ? 2 : 1,
                borderColor: selectedMethod === 'paypal' ? 'primary.main' : 'divider',
              }}
            >
              <FormControlLabel
                value="paypal"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img 
                      src="/images/paypal-logo.png" 
                      alt="PayPal" 
                      width={20} 
                      height={20} 
                      style={{ marginRight: 8 }}
                    />
                    <Typography>PayPal</Typography>
                  </Box>
                }
                sx={{ width: '100%' }}
              />
            </Paper>
          </Grid>
          
          {/* Mercado Pago */}
          <Grid item xs={12} sm={6}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                border: selectedMethod === 'mercado_pago' ? 2 : 1,
                borderColor: selectedMethod === 'mercado_pago' ? 'primary.main' : 'divider',
              }}
            >
              <FormControlLabel
                value="mercado_pago"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img 
                      src="/images/mercadopago-logo.png" 
                      alt="Mercado Pago" 
                      width={20} 
                      height={20} 
                      style={{ marginRight: 8 }}
                    />
                    <Typography>Mercado Pago</Typography>
                  </Box>
                }
                sx={{ width: '100%' }}
              />
            </Paper>
          </Grid>
          
          {/* OXXO */}
          <Grid item xs={12} sm={6}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                border: selectedMethod === 'oxxo' ? 2 : 1,
                borderColor: selectedMethod === 'oxxo' ? 'primary.main' : 'divider',
              }}
            >
              <FormControlLabel
                value="oxxo"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Store sx={{ mr: 1 }} />
                    <Typography>Pago en OXXO</Typography>
                  </Box>
                }
                sx={{ width: '100%' }}
              />
              <Collapse in={selectedMethod === 'oxxo'}>
                {renderOxxoInstructions()}
              </Collapse>
            </Paper>
          </Grid>
          
          {/* Bank Transfer */}
          <Grid item xs={12} sm={6}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                border: selectedMethod === 'bank_transfer' ? 2 : 1,
                borderColor: selectedMethod === 'bank_transfer' ? 'primary.main' : 'divider',
              }}
            >
              <FormControlLabel
                value="bank_transfer"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountBalance sx={{ mr: 1 }} />
                    <Typography>Transferencia bancaria</Typography>
                  </Box>
                }
                sx={{ width: '100%' }}
              />
              <Collapse in={selectedMethod === 'bank_transfer'}>
                {renderBankTransferInstructions()}
              </Collapse>
            </Paper>
          </Grid>
        </Grid>
      </RadioGroup>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
        <img src="/images/visa.png" alt="Visa" height="30" />
        <img src="/images/mastercard.png" alt="Mastercard" height="30" />
        <img src="/images/amex.png" alt="American Express" height="30" />
        <img src="/images/paypal.png" alt="PayPal" height="30" />
        <img src="/images/mercadopago.png" alt="Mercado Pago" height="30" />
        <img src="/images/oxxo.png" alt="OXXO" height="30" />
      </Box>
    </FormControl>
  );
};

export default PaymentMethodSelector;