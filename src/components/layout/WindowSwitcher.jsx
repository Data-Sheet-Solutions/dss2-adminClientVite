import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ButtonGroup, Button } from 'react-bootstrap';

const WindowSwitcher = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="d-flex justify-content-center mb-3">
      <ButtonGroup>
        <Button variant={isActive('/active') ? 'primary' : 'outline-primary'} onClick={() => navigate('/home/active')}>
          Active
        </Button>
        <Button variant={isActive('/pending/1') ? 'primary' : 'outline-primary'} onClick={() => navigate('/home/pending/1')}>
          P1
        </Button>
        <Button variant={isActive('/pending/2') ? 'primary' : 'outline-primary'} onClick={() => navigate('/home/pending/2')}>
          P2
        </Button>
        <Button variant={isActive('/pending/3') ? 'primary' : 'outline-primary'} onClick={() => navigate('/home/pending/3')}>
          P3
        </Button>
        <Button variant={isActive('/waiting') ? 'primary' : 'outline-primary'} onClick={() => navigate('/home/waiting')}>
          In Process
        </Button>
        <Button variant={isActive('/review') ? 'primary' : 'outline-primary'} onClick={() => navigate('/home/review')}>
          Needs Review
        </Button>
        <Button variant={isActive('/manufacturers') ? 'primary' : 'outline-primary'} onClick={() => navigate('/home/manufacturers')}>
          Manufacturers
        </Button>
        <Button variant={isActive('/clients') ? 'primary' : 'outline-primary'} onClick={() => navigate('/home/clients')}>
          Clients
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default WindowSwitcher;
