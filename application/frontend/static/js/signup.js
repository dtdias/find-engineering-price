/** @param {SubmitEvent} event   */
async function onSignUp(event) {
  event.preventDefault();
  const data = new FormData(event.target);
  try {
    const response = await CustomFetch.request('POST', `${env.API_URL}/auth/signup`, data);
    if(!response.id) throw "Erro inesperado"
    document.cookie = `userId=${response.id};`
    window.location.href= `/?userId=${response.id}`;
  }
  catch (error) {
    if (data.message.match(/missing required/i)) {
      return Notifier.Error("Preencha todos os campos.").showToast()
    }
    if (data.message.match(/already exists/i)) {
      return Notifier.Error("Usuário já cadastrado.").showToast();
    }
    Notifier.Error(error.message).showToast();
  }
}

document.forms['signup'].addEventListener('submit', onSignUp);