import Mailgen from 'mailgen';

export const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'Religious Notifications',
    link: 'https://glorify.africa',
    logo: 'https://religious-notification-data.s3.eu-west-1.amazonaws.com/assets/religious-notifs-logo.png',
  },
});
