import MuiGrid, { GridProps as MuiGridProps } from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { SxProps, Theme } from '@mui/material';

export interface GridProps extends Omit<MuiGridProps, 'item' | 'container'> {
  item?: boolean;
  container?: boolean;
  component?: React.ElementType;
  sx?: SxProps<Theme>;
  // Breakpoint props
  xs?: boolean | 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  sm?: boolean | 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  md?: boolean | 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  lg?: boolean | 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  xl?: boolean | 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

const StyledGrid = styled(MuiGrid, {
  shouldForwardProp: (prop) => 
    !['item', 'container', 'xs', 'sm', 'md', 'lg', 'xl'].includes(prop as string),
})<GridProps>(({ theme }) => ({}));

export const Grid = (props: GridProps) => {
  const { component = 'div', ...rest } = props;
  return <StyledGrid component={component} {...rest} />;
};

Grid.displayName = 'Grid';

export default Grid;
