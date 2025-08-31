import React from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Button,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { LocationOn, Add } from '@mui/icons-material';

// Mexican states
const mexicanStates = [
  { value: 'AGS', label: 'Aguascalientes' },
  { value: 'BC', label: 'Baja California' },
  { value: 'BCS', label: 'Baja California Sur' },
  { value: 'CAMP', label: 'Campeche' },
  { value: 'CHIS', label: 'Chiapas' },
  { value: 'CHIH', label: 'Chihuahua' },
  { value: 'COAH', label: 'Coahuila' },
  { value: 'COL', label: 'Colima' },
  { value: 'CDMX', label: 'Ciudad de México' },
  { value: 'DGO', label: 'Durango' },
  { value: 'GTO', label: 'Guanajuato' },
  { value: 'GRO', label: 'Guerrero' },
  { value: 'HGO', label: 'Hidalgo' },
  { value: 'JAL', label: 'Jalisco' },
  { value: 'MEX', label: 'Estado de México' },
  { value: 'MICH', label: 'Michoacán' },
  { value: 'MOR', label: 'Morelos' },
  { value: 'NAY', label: 'Nayarit' },
  { value: 'NL', label: 'Nuevo León' },
  { value: 'OAX', label: 'Oaxaca' },
  { value: 'PUE', label: 'Puebla' },
  { value: 'QRO', label: 'Querétaro' },
  { value: 'QROO', label: 'Quintana Roo' },
  { value: 'SLP', label: 'San Luis Potosí' },
  { value: 'SIN', label: 'Sinaloa' },
  { value: 'SON', label: 'Sonora' },
  { value: 'TAB', label: 'Tabasco' },
  { value: 'TAMPS', label: 'Tamaulipas' },
  { value: 'TLAX', label: 'Tlaxcala' },
  { value: 'VER', label: 'Veracruz' },
  { value: 'YUC', label: 'Yucatán' },
  { value: 'ZAC', label: 'Zacatecas' },
];

// Countries
const countries = [
  { value: 'MX', label: 'México' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'CA', label: 'Canadá' },
];

// Sample saved addresses
const savedAddresses = [
  {
    id: 1,
    name: 'Casa',
    firstName: 'Juan',
    lastName: 'Pérez',
    address1: 'Calle Reforma 123',
    address2: 'Colonia Centro',
    city: 'Ciudad de México',
    state: 'CDMX',
    postalCode: '06000',
    country: 'MX',
    phone: '5555555555',
    email: 'juan.perez@example.com',
    isDefault: true,
  },
  {
    id: 2,
    name: 'Oficina',
    firstName: 'Juan',
    lastName: 'Pérez',
    address1: 'Av. Insurgentes Sur 1234',
    address2: 'Piso 5, Oficina 503',
    city: 'Ciudad de México',
    state: 'CDMX',
    postalCode: '03100',
    country: 'MX',
    phone: '5555555555',
    email: 'juan.perez@example.com',
    isDefault: false,
  },
];

interface AddressFormProps {
  addressData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  setAddressData: React.Dispatch<React.SetStateAction<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>>;
}

/**
 * Form for collecting shipping address information
 */
const AddressForm: React.FC<AddressFormProps> = ({
  addressData,
  setAddressData,
}) => {
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setAddressData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  // Handle selecting a saved address
  const handleSelectAddress = (address: typeof savedAddresses[0]) => {
    setAddressData({
      firstName: address.firstName,
      lastName: address.lastName,
      email: address.email,
      phone: address.phone,
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    });
  };
  
  return (
    <>
      {/* Saved addresses section */}
      {savedAddresses.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Direcciones guardadas
          </Typography>
          <Grid container spacing={2}>
            {savedAddresses.map((address) => (
              <Grid item xs={12} sm={6} key={address.id}>
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                  onClick={() => handleSelectAddress(address)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">
                      {address.name}
                    </Typography>
                    {address.isDefault && (
                      <Typography variant="caption" sx={{ color: 'primary.main' }}>
                        Predeterminada
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body2">
                    {address.firstName} {address.lastName}
                  </Typography>
                  <Typography variant="body2">
                    {address.address1}
                  </Typography>
                  {address.address2 && (
                    <Typography variant="body2">
                      {address.address2}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    {address.city}, {address.state}, {address.postalCode}
                  </Typography>
                  <Typography variant="body2">
                    {countries.find(c => c.value === address.country)?.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Add color="primary" sx={{ mb: 1 }} />
                <Typography variant="body2" color="primary">
                  Agregar nueva dirección
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            O ingresa una nueva dirección
          </Typography>
        </Box>
      )}
      
      {/* Address form */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="firstName"
            name="firstName"
            label="Nombre"
            fullWidth
            autoComplete="given-name"
            value={addressData.firstName}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="lastName"
            name="lastName"
            label="Apellidos"
            fullWidth
            autoComplete="family-name"
            value={addressData.lastName}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="email"
            name="email"
            label="Correo electrónico"
            fullWidth
            autoComplete="email"
            type="email"
            value={addressData.email}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="phone"
            name="phone"
            label="Teléfono"
            fullWidth
            autoComplete="tel"
            value={addressData.phone}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="address1"
            name="address1"
            label="Dirección"
            fullWidth
            autoComplete="shipping address-line1"
            value={addressData.address1}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="address2"
            name="address2"
            label="Apartamento, suite, etc. (opcional)"
            fullWidth
            autoComplete="shipping address-line2"
            value={addressData.address2}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="city"
            name="city"
            label="Ciudad"
            fullWidth
            autoComplete="shipping address-level2"
            value={addressData.city}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel id="state-label">Estado</InputLabel>
            <Select
              labelId="state-label"
              id="state"
              name="state"
              value={addressData.state}
              label="Estado"
              onChange={handleChange}
              autoComplete="shipping address-level1"
            >
              {mexicanStates.map((state) => (
                <MenuItem key={state.value} value={state.value}>
                  {state.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="postalCode"
            name="postalCode"
            label="Código postal"
            fullWidth
            autoComplete="shipping postal-code"
            value={addressData.postalCode}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel id="country-label">País</InputLabel>
            <Select
              labelId="country-label"
              id="country"
              name="country"
              value={addressData.country}
              label="País"
              onChange={handleChange}
              autoComplete="shipping country"
            >
              {countries.map((country) => (
                <MenuItem key={country.value} value={country.value}>
                  {country.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="outlined"
            startIcon={<LocationOn />}
            onClick={() => {
              // This would typically use a geolocation API
              alert('Esta función utilizaría la API de geolocalización para autocompletar tu dirección.');
            }}
          >
            Usar mi ubicación actual
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default AddressForm;