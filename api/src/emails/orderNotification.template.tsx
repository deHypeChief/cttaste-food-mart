import React from "react";
import { Html, Head, Body, Container, Section, Text, Heading, render, Img } from '@react-email/components';

interface OrderData {
    orderNumber: string;
    vendorName: string;
    customerName: string;
    total: number;
    items: Array<{ name: string; quantity: number; price: number }>;
}

export const OrderNotificationEmail = ({ orderNumber, vendorName, customerName, total, items }: OrderData) => {
    return (
        <Html>
            <Head />
            <Body style={styles.body}>
                <Container style={styles.container}>
                    <Heading style={styles.heading}>New Order Received</Heading>
                    <Text style={styles.text}>Hello {vendorName},</Text>
                    <Text style={styles.text}>You have received a new order <strong>{orderNumber}</strong> from <strong>{customerName}</strong>.</Text>

                    <Section style={styles.section}>
                        {items.map((it, i) => (
                            <Text key={i} style={styles.item}>{it.quantity} × {it.name} — {it.price.toFixed(2)}</Text>
                        ))}
                    </Section>

                    <Text style={styles.text}>Total: <strong>{total.toFixed(2)}</strong></Text>
                    <Text style={styles.footer}>Please check your dashboard to accept and manage this order.</Text>
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

export const orderNotification = async (data: OrderData): Promise<string> => {
    return await render(<OrderNotificationEmail {...data} />);
}

export default OrderNotificationEmail;
