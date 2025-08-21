import React from "react";
import { Html, Head, Body, Container, Section, Text, Heading, Link, render, Img } from '@react-email/components';


interface SignInData {
    name: string;
    time?: string;
    ip?: string;
}


const styles = {
  rounded:{
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
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    fontSize: '24px',
    color: '#333333',
    marginBottom: '20px',
  },
  text: {
    fontSize: '16px',
    color: '#555555',
    lineHeight: '1.5',
    marginBottom: '20px',
  },
  buttonSection: {
    textAlign: 'center' as 'center',
    margin: '20px 0',
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#4CAF50',
    color: '#ffffff',
    padding: '10px 20px',
    fontSize: '16px',
    textDecoration: 'none',
    borderRadius: '5px',
  },
  footer: {
    fontSize: '14px',
    color: '#888888',
    marginTop: '20px',
    textAlign: 'center' as 'center',
  },
};

export const SignInAlertEmail = ({ name, time, ip }: SignInData) => {
    const when = time || new Date().toLocaleString();
    const origin = Bun.env.ACTIVE_API_ORIGIN || Bun.env.ACTIVE_CLIENT_ORIGIN || 'http://localhost:8000';
    const logo = `${origin.replace(/\/$/, '')}/static/singleLogoRed.png`;
    return (
      <Html>
        <Head />
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Img
              alt={Bun.env.PLATFORM_NAME}
              style={styles.rounded}
              height={80}
              src={logo}
            />
            <Heading style={styles.heading}>New sign-in to your account</Heading>
            <Text style={styles.text}>
              Hey {name},
            </Text>
            <Text style={styles.text}>
              We detected a sign-in to your {Bun.env.PLATFORM_NAME} account on <strong>{when}</strong> {ip ? `from IP ${ip}` : ''}.
            </Text>
            <Text style={styles.text}>
              If this was you, no further action is needed. If you did not sign in, please reset your password or contact our support immediately.
            </Text>
            <Text style={styles.footer}>Regards, <br /> The {Bun.env.PLATFORM_NAME} team</Text>
          </Container>
        </Body>
      </Html>
    );
  };
  

export const signIn = async (data: SignInData): Promise<string> => {
  return await render(<SignInAlertEmail name={data.name} time={data.time} ip={data.ip}/>);
};

export default SignInAlertEmail