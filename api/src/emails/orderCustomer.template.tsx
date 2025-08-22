import React from "react";
import { Html, Head, Body, Container, Section, Text, Heading, Link, render, Img } from '@react-email/components';

interface CustomerOrderData {
    orderNumber: string;
    customerName: string;
    total: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    orderId: string;
}

export const CustomerOrderEmail = ({ orderNumber, customerName, total, items, orderId }: CustomerOrderData) => {
    const origin = Bun.env.ACTIVE_CLIENT_ORIGIN || Bun.env.ACTIVE_API_ORIGIN || 'http://localhost:3000';
    const root = origin.replace(/\/$/, '');
    const vorderUrl = `${root}/vorder/${orderId}`;
    return (
        <Html>
            <Head />
            <Body style={styles.body}>
                <Container style={styles.container}>
                    <Heading style={styles.heading}>Order Received</Heading>
                    <Text style={styles.text}>Hello {customerName || 'Customer'},</Text>
                    <Text style={styles.text}>Thanks — we have received your order <strong>{orderNumber}</strong>. Below is a summary of your order.</Text>

                    <Section style={styles.section}>
                        {items.map((it, i) => (
                            <Text key={i} style={styles.item}>{it.quantity} × {it.name} — ₦{Number(it.price).toLocaleString()}</Text>
                        ))}
                    </Section>

                    <Text style={styles.text}>Total: <strong>₦ {Number(total).toLocaleString()}</strong></Text>
                    <Text style={styles.text}>Order summary: <Link href={vorderUrl}>{vorderUrl}</Link></Text>
                    <Text style={styles.footer}>You'll receive updates on the order status. Thank you for ordering with us.</Text>
                </Container>
            </Body>
        </Html>
    );
}

const styles = {
    body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', margin: 0, padding: 0 },
    container: { maxWidth: '600px', margin: '20px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px' },
    heading: { fontSize: '20px', color: '#333', marginBottom: '10px' },
    text: { fontSize: '14px', color: '#555', marginBottom: '10px' },
    section: { marginTop: '10px', marginBottom: '10px' },
    item: { fontSize: '13px', color: '#444' },
    footer: { fontSize: '12px', color: '#888', marginTop: '20px' }
}

export const orderCustomer = async (data: CustomerOrderData): Promise<string> => {
    return await render(<CustomerOrderEmail {...data} />);
}

export default CustomerOrderEmail;
