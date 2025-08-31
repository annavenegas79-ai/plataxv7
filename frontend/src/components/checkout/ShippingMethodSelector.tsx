import React from 'react';
import {
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import {
  LocalShipping,
  FlashOn,
  Store,
  LocationOn,
  AccessTime,
} from '@mui/icons-material';
import { ShippingMethod } from './OneStepCheckout';

interface ShippingMethodSelectorProps {
  selectedMethod: ShippingMethod;
  onSelectMethod: (method: ShippingMethod) => void;
}

/**
 * Component for selecting shipping methods
 */
const ShippingMethodSelector: React.FC<ShippingMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
}) => {
  const handleMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelectMethod(event.target.value as ShippingMethod);
  };
  
  // Shipping method details
  const shippingMethods = [
    {
      value: 'standard',
      label: 'Envío estándar',
      icon: <LocalShipping />,
      price: 'MXN $99.00',
      time: '3-5 días hábiles',
      description: 'Entrega a domicilio con servicio estándar.',
    },
    {
      value: 'express',
      label: 'Envío express',
      icon: <FlashOn />,
      price: 'MXN $149.00',
      time: '1-2 días hábiles',
      description: 'Entrega rápida a domicilio con prioridad.',
      highlight: true,
    },
    {
      value: 'same_day',
      label: 'Entrega el mismo día',
      icon: <AccessTime />,
      price: 'MXN $199.00',
      time: 'Hoy (pedidos antes de las 13:00)',
      description: 'Disponible solo en ciertas zonas de la ciudad.',
      highlight: true,
    },
    {
      value: 'pickup_point',
      label: 'Punto de recogida',
      icon: <LocationOn />,
      price: 'MXN $49.00',
      time: '2-4 días hábiles',
      description: 'Recoge tu pedido en un punto de entrega cercano.',
    },
    {
      value: 'store_pickup',
      label: 'Recoger en tienda',
      icon: <Store />,
      price: 'GRATIS',
      time: '1-3 días hábiles',
      description: 'Recoge tu pedido en nuestra tienda sin costo adicional.',
    },
  ];
  
  return (
    <FormControl component="fieldset" fullWidth>
      <RadioGroup
        aria-label="shipping-method"
        name="shipping-method"
        value={selectedMethod}
        onChange={handleMethodChange}
      >
        <Grid container spacing={2}>
          {shippingMethods.map((method) => (
            <Grid item xs={12} key={method.value}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  border: selectedMethod === method.value ? 2 : 1,
                  borderColor: selectedMethod === method.value ? 'primary.main' : 'divider',
                  position: 'relative',
                }}
              >
                {method.highlight && (
                  <Chip 
                    label="Recomendado" 
                    color="primary" 
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      top: -10, 
                      right: 16,
                    }}
                  />
                )}
                <FormControlLabel
                  value={method.value}
                  control={<Radio />}
                  label={
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 1 }}>
                            {method.icon}
                          </Box>
                          <Typography variant="subtitle1">
                            {method.label}
                          </Typography>
                        </Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {method.price}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {method.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTime fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {method.time}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </RadioGroup>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
        <img src="/images/dhl.png" alt="DHL" height="30" />
        <img src="/images/fedex.png" alt="FedEx" height="30" />
        <img src="/images/estafeta.png" alt="Estafeta" height="30" />
        <img src="/images/ups.png" alt="UPS" height="30" />
        <img src="/images/correos-mexico.png" alt="Correos de México" height="30" />
      </Box>
    </FormControl>
  );
};

export default ShippingMethodSelector;