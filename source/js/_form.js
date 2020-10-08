import Toast from './_toasts';
import Email from './_smtp';

const contactForm = document.getElementById('contact-form');

const token = '49fdf947-d745-4e41-896a-9153886937ea';
const toEmail = 'fabianowty@gmail.com';
const fromEmail = 'derartisa@gmail.com';

const sendEmail = (to, from, subject, body) => {
  return Email.send({
    SecureToken: token,
    To: to,
    From: from,
    Subject: subject,
    Body: body,
  });
};

const handleSubmit = (evt) => {
  evt.preventDefault();

  const {
    fieldName,
    fieldEmail,
    fieldMessage,
    sendButton,
  } = contactForm.elements;
  const body = `
    From: ${fieldEmail.value};
    Name: ${fieldName.value};

    Message: ${fieldMessage.value}
  `;

  sendButton.disabled = true;
  sendEmail(toEmail, fromEmail, 'Portfolio Feedback...', body).then(
    (message) => {
      let response, className;

      if (message === 'OK') {
        response = 'Thank you for your message!';
        className = 'toast--success';

        contactForm.reset();
        sendButton.disabled = true;
      } else {
        response =
          'Sorry! Failed to send your message. Please contact me directly fabianowty@gmail.com.';
        className = 'toast--error';

        sendButton.disabled = false;
      }

      new Toast(response, className);
    }
  );
};

const handleInput = (evt) => {
  const target = evt.target;
  const formGroup = target.parentElement;

  if (!target.checkValidity()) {
    formGroup.classList.add('form__group--invalid');
    formGroup.classList.remove('form__group--valid');
  } else {
    formGroup.classList.add('form__group--valid');
    formGroup.classList.remove('form__group--invalid');
  }

  contactForm.elements.sendButton.disabled = !contactForm.checkValidity();
};

const handleChange = (evt) => {
  const formGroup = evt.target.parentElement;

  if (formGroup.classList.contains('form__group--invalid')) {
    new Toast(evt.target.validationMessage, 'toast--warning');
  }
};

contactForm.addEventListener('submit', handleSubmit);
contactForm.addEventListener('input', handleInput);
contactForm.addEventListener('change', handleChange);
