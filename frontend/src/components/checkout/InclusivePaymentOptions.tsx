import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Divider,
  TextField,
  InputAdornment,
  Collapse,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Payment,
  AccountBalance,
  CreditCard,
  LocalAtm,
  QrCode,
  Phone,
  Store,
  Receipt,
  Info,
  CheckCircle,
  AccessTime,
  Help,
} from '@mui/icons-material';

// Types for payment methods
interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  type: 'card' | 'bank' | 'cash' | 'mobile' | 'alternative';
  icon: React.ReactNode;
  requiresInternet: boolean;
  processingTime: string;
  additionalInfo?: string;
}

// Props interface
interface InclusivePaymentOptionsProps {
  onPaymentMethodSelect?: (methodId: string) => void;
  amount?: number;
}

/**
 * Component for inclusive payment options
 */
const InclusivePaymentOptions: React.FC<InclusivePaymentOptionsProps> = ({
  onPaymentMethodSelect,
  amount = 0,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [infoMethod, setInfoMethod] = useState<PaymentMethod | null>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [installments, setInstallments] = useState<string>('1');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [showMobilePayment, setShowMobilePayment] = useState<boolean>(false);
  
  // Sample payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Tarjeta de crédito/débito',
      description: 'Paga con cualquier tarjeta de crédito o débito.',
      type: 'card',
      icon: <CreditCard />,
      requiresInternet: true,
      processingTime: 'Inmediato',
    },
    {
      id: 'bank_transfer',
      name: 'Transferencia bancaria',
      description: 'Realiza una transferencia desde tu cuenta bancaria.',
      type: 'bank',
      icon: <AccountBalance />,
      requiresInternet: true,
      processingTime: '1-2 días hábiles',
    },
    {
      id: 'cash_payment',
      name: 'Pago en efectivo',
      description: 'Paga en efectivo en tiendas de conveniencia o bancos asociados.',
      type: 'cash',
      icon: <LocalAtm />,
      requiresInternet: false,
      processingTime: '1 día hábil después de realizar el pago',
      additionalInfo: 'Genera un código de pago y preséntalo en cualquier tienda afiliada para pagar en efectivo.',
    },
    {
      id: 'mobile_payment',
      name: 'Pago móvil',
      description: 'Paga utilizando tu saldo de teléfono móvil o aplicaciones de pago móvil.',
      type: 'mobile',
      icon: <Phone />,
      requiresInternet: true,
      processingTime: 'Inmediato',
    },
    {
      id: 'oxxo',
      name: 'Pago en OXXO',
      description: 'Genera un código de pago y paga en cualquier tienda OXXO.',
      type: 'cash',
      icon: <Store />,
      requiresInternet: false,
      processingTime: '1-2 días hábiles después de realizar el pago',
      additionalInfo: 'El código de pago tiene una validez de 48 horas. Una vez realizado el pago, puede tomar hasta 2 días hábiles en reflejarse en nuestro sistema.',
    },
    {
      id: 'qr_payment',
      name: 'Pago con código QR',
      description: 'Escanea un código QR para pagar con tu aplicación bancaria o de pagos.',
      type: 'alternative',
      icon: <QrCode />,
      requiresInternet: true,
      processingTime: 'Inmediato',
    },
  ];
  
  // Handle payment method selection
  const handleMethodSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedMethod(value);
    
    // Show mobile payment form if mobile payment is selected
    if (value === 'mobile_payment') {
      setShowMobilePayment(true);
    } else {
      setShowMobilePayment(false);
    }
    
    if (onPaymentMethodSelect) {
      onPaymentMethodSelect(value);
    }
  };
  
  // Handle installments change
  const handleInstallmentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInstallments(event.target.value);
  };
  
  // Handle mobile number change
  const handleMobileNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMobileNumber(event.target.value);
  };
  
  // Open info dialog
  const handleOpenInfo = (method: PaymentMethod) => {
    setInfoMethod(method);
    setShowInfo(true);
  };
  
  // Close info dialog
  const handleCloseInfo = () => {
    setShowInfo(false);
  };
  
  // Handle payment submission
  const handlePaymentSubmit = () => {
    // In a real implementation, this would process the payment
    // For this example, we just show a success dialog
    setShowSuccess(true);
  };
  
  // Get selected method
  const getSelectedMethod = () => {
    return paymentMethods.find(method => method.id === selectedMethod);
  };
  
  // Calculate installment amount
  const calculateInstallmentAmount = () => {
    if (!amount || !installments) return 0;
    return amount / parseInt(installments);
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Opciones de pago inclusivas
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Ofrecemos múltiples opciones de pago para adaptarnos a tus necesidades, incluyendo métodos que no requieren acceso a internet o servicios bancarios tradicionales.
      </Typography>
      
      <FormControl component="fieldset" sx={{ width: '100%' }}>
        <RadioGroup
          aria-label="payment-methods"
          name="payment-methods"
          value={selectedMethod}
          onChange={handleMethodSelect}
        >
          <Grid container spacing={2}>
            {paymentMethods.map((method) => (
              <Grid item xs={12} sm={6} key={method.id}>
                <Card
                  variant="outlined"
                  sx={{
                    border: '1px solid',
                    borderColor: selectedMethod === method.id ? 'primary.main' : 'divider',
                    bgcolor: selectedMethod === method.id ? 'action.hover' : 'background.paper',
                  }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Radio
                        checked={selectedMethod === method.id}
                        onChange={handleMethodSelect}
                        value={method.id}
                        name="payment-method-radio"
                      />
                      
                      <Box sx={{ ml: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 1, color: 'primary.main' }}>
                            {method.icon}
                          </Box>
                          
                          <Typography variant="subtitle1">
                            {method.name}
                          </Typography>
                          
                          {!method.requiresInternet && (
                            <Chip
                              label="No requiere internet"
                              size="small"
                              color="success"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          {method.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <AccessTime fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="caption" color="text.secondary">
                            Tiempo de procesamiento: {method.processingTime}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<Info />}
                      onClick={() => handleOpenInfo(method)}
                    >
                      Más información
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </RadioGroup>
      </FormControl>
      
      {/* Credit card installments */}
      <Collapse in={selectedMethod === 'card'}>
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Opciones de pago a plazos
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Divide tu pago en cuotas mensuales sin intereses.
          </Typography>
          
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              aria-label="installments"
              name="installments"
              value={installments}
              onChange={handleInstallmentsChange}
            >
              <Grid container spacing={2}>
                {[1, 3, 6, 12].map((option) => (
                  <Grid item xs={6} sm={3} key={option}>
                    <FormControlLabel
                      value={option.toString()}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body2">
                            {option === 1 ? 'Pago único' : `${option} cuotas`}
                          </Typography>
                          {option > 1 && amount > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              ${(amount / option).toFixed(2)}/mes
                            </Typography>
                          )}
                        </Box>
                      }
                      sx={{ m: 0 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </RadioGroup>
          </FormControl>
        </Box>
      </Collapse>
      
      {/* Mobile payment form */}
      <Collapse in={showMobilePayment}>
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Pago con saldo telefónico
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Ingresa tu número de teléfono para pagar con tu saldo o recibir instrucciones de pago.
          </Typography>
          
          <TextField
            label="Número de teléfono"
            variant="outlined"
            fullWidth
            value={mobileNumber}
            onChange={handleMobileNumberChange}
            placeholder="Ej. 55 1234 5678"
            InputProps={{
              startAdornment: <InputAdornment position="start">+52</InputAdornment>,
            }}
            sx={{ mb: 2 }}
          />
          
          <Alert severity="info">
            Se enviará un mensaje SMS con un código de confirmación. Pueden aplicar tarifas de mensajería estándar.
          </Alert>
        </Box>
      </Collapse>
      
      {/* Cash payment instructions */}
      <Collapse in={selectedMethod === 'cash_payment' || selectedMethod === 'oxxo'}>
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Instrucciones de pago en efectivo
          </Typography>
          
          <Typography variant="body2" paragraph>
            1. Al confirmar tu pedido, generaremos un código de pago único.
          </Typography>
          
          <Typography variant="body2" paragraph>
            2. Lleva este código a cualquier {selectedMethod === 'oxxo' ? 'tienda OXXO' : 'establecimiento afiliado'} dentro de las próximas 48 horas.
          </Typography>
          
          <Typography variant="body2" paragraph>
            3. Realiza el pago en efectivo y conserva tu recibo.
          </Typography>
          
          <Typography variant="body2" paragraph>
            4. Una vez procesado tu pago, recibirás una confirmación por correo electrónico.
          </Typography>
          
          <Alert severity="warning">
            El procesamiento de pagos en efectivo puede tomar hasta 48 horas en reflejarse en nuestro sistema.
          </Alert>
        </Box>
      </Collapse>
      
      {/* Payment button */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Payment />}
          disabled={!selectedMethod || (selectedMethod === 'mobile_payment' && !mobileNumber)}
          onClick={handlePaymentSubmit}
        >
          {selectedMethod === 'cash_payment' || selectedMethod === 'oxxo' 
            ? 'Generar código de pago' 
            : `Pagar $${amount.toFixed(2)}`}
        </Button>
      </Box>
      
      {/* Info dialog */}
      <Dialog
        open={showInfo}
        onClose={handleCloseInfo}
        maxWidth="sm"
        fullWidth
      >
        {infoMethod && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 1, color: 'primary.main' }}>
                  {infoMethod.icon}
                </Box>
                {infoMethod.name}
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Typography variant="body1" paragraph>
                {infoMethod.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Detalles del método de pago
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Tiempo de procesamiento: {infoMethod.processingTime}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Info fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {infoMethod.requiresInternet 
                        ? 'Requiere conexión a internet para completar el pago' 
                        : 'No requiere conexión a internet para completar el pago'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Ventajas
                  </Typography>
                  
                  {infoMethod.type === 'card' && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          Procesamiento inmediato
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          Opciones de pago a plazos
                        </Typography>
                      </Box>
                    </>
                  )}
                  
                  {infoMethod.type === 'cash' && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          No requiere tarjeta de crédito/débito
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          Ideal para quienes prefieren pagar en efectivo
                        </Typography>
                      </Box>
                    </>
                  )}
                  
                  {infoMethod.type === 'mobile' && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          Conveniente para pagos desde el móvil
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          No requiere información bancaria
                        </Typography>
                      </Box>
                    </>
                  )}
                  
                  {infoMethod.type === 'bank' && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          Seguro y confiable
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          Sin comisiones adicionales
                        </Typography>
                      </Box>
                    </>
                  )}
                </Grid>
              </Grid>
              
              {infoMethod.additionalInfo && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  {infoMethod.additionalInfo}
                </Alert>
              )}
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseInfo}>
                Cerrar
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  handleCloseInfo();
                  setSelectedMethod(infoMethod.id);
                  
                  if (infoMethod.id === 'mobile_payment') {
                    setShowMobilePayment(true);
                  }
                }}
              >
                Seleccionar este método
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Success dialog */}
      <Dialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          {(selectedMethod === 'cash_payment' || selectedMethod === 'oxxo') ? (
            <>
              <QrCode color="primary" sx={{ fontSize: 100, mb: 2 }} />
              
              <Typography variant="h5" gutterBottom>
                Código de pago generado
              </Typography>
              
              <Typography variant="body1" paragraph>
                Presenta este código en cualquier {selectedMethod === 'oxxo' ? 'tienda OXXO' : 'establecimiento afiliado'} para realizar tu pago.
              </Typography>
              
              <Box sx={{ 
                p: 3, 
                border: '2px dashed', 
                borderColor: 'divider',
                borderRadius: 1,
                display: 'inline-block',
                mb: 2
              }}>
                <Typography variant="h6">
                  93847562198
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Este código expirará en 48 horas. Hemos enviado estas instrucciones a tu correo electrónico.
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<Receipt />}
                  onClick={() => {}}
                >
                  Descargar instrucciones
                </Button>
              </Box>
            </>
          ) : (
            <>
              <CheckCircle color="success" sx={{ fontSize: 100, mb: 2 }} />
              
              <Typography variant="h5" gutterBottom>
                ¡Pago procesado con éxito!
              </Typography>
              
              <Typography variant="body1" paragraph>
                Tu pago ha sido procesado correctamente.
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Hemos enviado un recibo a tu correo electrónico. Tu pedido será procesado inmediatamente.
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<Receipt />}
                  onClick={() => {}}
                >
                  Ver recibo
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowSuccess(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InclusivePaymentOptions;