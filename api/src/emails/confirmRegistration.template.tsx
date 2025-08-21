import React from 'react';
import { Html, Head, Body, Container, Section, Text, Heading, Link, render, Img } from '@react-email/components';

interface ConfirmData {
  name: string;
  confirmUrl: string;
}

const styles = {
  rounded: {
    borderRadius: '100px',
  },
  body: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: '600px',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  heading: {
    fontSize: '22px',
    color: '#333333',
    marginBottom: '10px'
  },
  text: {
    fontSize: '16px',
    color: '#555555',
    lineHeight: '1.5',
    marginBottom: '12px'
  },
  buttonSection: {
    textAlign: 'center' as 'center',
    margin: '20px 0'
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#EF4444',
    color: '#ffffff',
    padding: '12px 22px',
    fontSize: '16px',
    textDecoration: 'none',
    borderRadius: '6px'
  },
  footer: {
    fontSize: '14px',
    color: '#888888',
    marginTop: '20px',
    textAlign: 'center' as 'center'
  }
};

export const ConfirmEmail = ({ name, confirmUrl }: ConfirmData) => {
  const origin = Bun.env.ACTIVE_API_ORIGIN || Bun.env.ACTIVE_CLIENT_ORIGIN || 'http://localhost:8000';
  const logo = `${origin.replace(/\/$/, '')}/static/singleLogoRed.png`;
  return (
  <Html>
    <Head />
    <Body style={styles.body}>
      <Container style={styles.container}>
        <Img alt="Logo" style={styles.rounded} height={80} src={logo} />
        <Heading style={styles.heading}>Confirm your email, {name}</Heading>
        <Text style={styles.text}>Thanks for signing up. Click the button below to confirm your email and activate your account.</Text>
        <Section style={styles.buttonSection}>
          <Link href={confirmUrl} style={styles.button}>Confirm my email</Link>
        </Section>
        <Text style={styles.text}>If the button doesn't work, copy and paste the following link into your browser:</Text>
        <Text style={{ ...styles.text, wordBreak: 'break-all' }}>{confirmUrl}</Text>
        <Text style={styles.footer}>If you didn't sign up, you can ignore this email.</Text>
      </Container>
    </Body>
  </Html>
  );
};
 

export const renderConfirm = async (data: ConfirmData): Promise<string> => render(<ConfirmEmail {...data} />);

export default ConfirmEmail;
