/** @param {SubmitEvent} event   */
async function onSignIn(event) {
  event.preventDefault();
  try {
    const data = await CustomFetch.request('POST', '/auth/signin', new FormData(event.target));
    localStorage.setItem('__token', data.token);
    document.cookie = `userId=${data.id};`
    window.location.href = `/?userId=${data.id}`;
  } catch (error) {
    if (error.message.match(/(email|password)/i)) {
      return  Notifier.Error("Email ou senha incorretos.").showToast();
    }
    Notifier.Error("Falha inesperada.").showToast()
  }
}

document.forms['signin'].addEventListener('submit', onSignIn);