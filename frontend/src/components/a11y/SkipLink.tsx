import React from 'react';
import { styled } from '@mui/material/styles';

interface SkipLinkProps {
  targetId: string;
  label?: string;
}

const StyledSkipLink = styled('a')(({ theme }) => ({
  position: 'absolute',
  top: -50,
  left: 0,
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  zIndex: theme.zIndex.tooltip + 1,
  textDecoration: 'none',
  fontWeight: 500,
  borderRadius: '0 0 4px 0',
  transition: 'top 0.2s ease-in-out',
  '&:focus': {
    top: 0,
    outline: `2px solid ${theme.palette.secondary.main}`,
    outlineOffset: 2,
  },
}));

/**
 * A skip link for keyboard users to bypass navigation
 * and jump directly to the main content
 */
const SkipLink: React.FC<SkipLinkProps> = ({
  targetId,
  label = 'Saltar al contenido principal',
}) => {
  return (
    <StyledSkipLink href={`#${targetId}`}>
      {label}
    </StyledSkipLink>
  );
};

export default SkipLink;