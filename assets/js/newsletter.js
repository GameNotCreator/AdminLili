document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const boldButton = document.getElementById('bold');
    const underlineButton = document.getElementById('underline');
    const fontsizeSelect = document.getElementById('fontsize');
    const emailTitle = document.getElementById('email-title').value;
    const sendButton = document.getElementById('send');

    boldButton.addEventListener('click', () => {
        document.execCommand('bold', false, null);
    });

    underlineButton.addEventListener('click', () => {
        document.execCommand('underline', false, null);
    });

    fontsizeSelect.addEventListener('change', (event) => {
        document.execCommand('fontSize', false, event.target.value);
    });

    sendButton.addEventListener('click', async () => {
        const title = emailTitle.value;
        const content = editor.innerHTML;
        try {
            const response = await fetch('/api/newsletter/send-newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content }),
            });

            if (response.ok) {
                alert('Newsletter envoyée avec succès');
            } else {
                alert('Erreur lors de l\'envoi de la newsletter');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erreur lors de l\'envoi de la newsletter');
        }
    });
});
