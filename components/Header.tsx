'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function Header() {
  const pathname = usePathname();
  const isEditor = pathname.startsWith('/book/');

  return (
    <AppBar position="static" color="default" elevation={0}
      sx={{ height: 56, justifyContent: 'center' }}>
      <Toolbar sx={{ minHeight: 56, px: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
        >
          <MenuBookIcon sx={{ mr: isEditor ? 0 : 1 }} />
          {!isEditor && <Typography variant="h6">マイブック</Typography>}
        </Link>
        {isEditor && <Typography variant="h6">三分割エディタ</Typography>}
        <IconButton aria-label="ヘルプ">
          <HelpOutlineIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
