import React from 'react';
import { Chip, Tooltip, Box, Typography, SvgIcon } from '@mui/material';
import { styled } from '@mui/material/styles';

// Custom eco-friendly icon
const EcoIcon = (props: any) => (
  <SvgIcon {...props}>
    <path d="M7,5.5C7,6.33 6.33,7 5.5,7C4.67,7 4,6.33 4,5.5C4,4.67 4.67,4 5.5,4C6.33,4 7,4.67 7,5.5M19.07,4.93C19.07,4.93 17.07,2.93 14.07,2.93C11.07,2.93 8.07,5.93 8.07,5.93C8.07,5.93 10.07,2.93 13.07,2.93C16.07,2.93 19.07,4.93 19.07,4.93M22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2C17.5,2 22,6.5 22,12M15,12C15,10.34 13.66,9 12,9C10.34,9 9,10.34 9,12C9,13.66 10.34,15 12,15C13.66,15 15,13.66 15,12M17,12C17,14.76 14.76,17 12,17C9.24,17 7,14.76 7,12C7,9.24 9.24,7 12,7C14.76,7 17,9.24 17,12M19,12C19,15.87 15.87,19 12,19C8.13,19 5,15.87 5,12C5,8.13 8.13,5 12,5C15.87,5 19,8.13 19,12Z" />
  </SvgIcon>
);

// Styled components
const StyledChip = styled(Chip)(({ theme, color }) => ({
  backgroundColor: color === 'carbon_neutral' 
    ? 'rgba(76, 175, 80, 0.1)' 
    : color === 'recycled' 
      ? 'rgba(3, 169, 244, 0.1)'
      : 'rgba(139, 195, 74, 0.1)',
  color: color === 'carbon_neutral' 
    ? theme.palette.success.main 
    : color === 'recycled' 
      ? theme.palette.info.main
      : theme.palette.success.dark,
  border: `1px solid ${
    color === 'carbon_neutral' 
      ? theme.palette.success.light 
      : color === 'recycled' 
        ? theme.palette.info.light
        : theme.palette.success.light
  }`,
  '& .MuiChip-icon': {
    color: 'inherit'
  }
}));

// Badge types
export type EcoBadgeType = 'eco_friendly' | 'carbon_neutral' | 'recycled' | 'sustainable_packaging';

// Props interface
interface EcoFriendlyBadgeProps {
  type: EcoBadgeType;
  size?: 'small' | 'medium';
  variant?: 'default' | 'detailed';
  onClick?: () => void;
}

// Badge configuration
const badgeConfig = {
  eco_friendly: {
    label: 'Eco-Friendly',
    icon: <EcoIcon />,
    description: 'Este producto está fabricado con materiales sostenibles y procesos que minimizan el impacto ambiental.'
  },
  carbon_neutral: {
    label: 'Carbono Neutral',
    icon: <EcoIcon />,
    description: 'La huella de carbono de este producto ha sido calculada y compensada mediante proyectos de reducción de emisiones.'
  },
  recycled: {
    label: 'Material Reciclado',
    icon: <EcoIcon />,
    description: 'Este producto está fabricado con materiales reciclados, reduciendo el consumo de recursos naturales.'
  },
  sustainable_packaging: {
    label: 'Embalaje Sostenible',
    icon: <EcoIcon />,
    description: 'Este producto utiliza embalaje biodegradable, compostable o reciclable, minimizando los residuos.'
  }
};

/**
 * Component for displaying eco-friendly badges on products
 */
const EcoFriendlyBadge: React.FC<EcoFriendlyBadgeProps> = ({
  type,
  size = 'small',
  variant = 'default',
  onClick
}) => {
  const config = badgeConfig[type];
  
  // Simple chip badge
  if (variant === 'default') {
    return (
      <Tooltip title={config.description}>
        <StyledChip
          icon={config.icon}
          label={config.label}
          size={size}
          color={type as any}
          onClick={onClick}
          clickable={!!onClick}
        />
      </Tooltip>
    );
  }
  
  // Detailed badge with more information
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 1,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        maxWidth: 200,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          bgcolor: 'action.hover',
        } : {},
      }}
      onClick={onClick}
    >
      <StyledChip
        icon={config.icon}
        label={config.label}
        size={size}
        color={type as any}
      />
      <Typography variant="caption" align="center" sx={{ mt: 1 }}>
        {config.description}
      </Typography>
    </Box>
  );
};

export default EcoFriendlyBadge;