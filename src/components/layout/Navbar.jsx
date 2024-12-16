import React from 'react';
import { Navbar as BootstrapNavbar, Container, Nav, Button } from 'react-bootstrap';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin + '/fulfill/' });
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <Container fluid>
        <BootstrapNavbar.Brand href="#home">DSS Administration</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {keycloak?.authenticated && (
              <div className="d-flex align-items-center">
                <span className="text-light me-3">{keycloak.tokenParsed?.preferred_username}</span>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
