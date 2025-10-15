# Use a imagem oficial do Nginx como base
FROM nginx

# Copie o arquivo nginx.conf.template do contexto de construção para o diretório de configuração do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Defina as variáveis de ambiente para configuração
ENV PROXYPORT=${PROXYPORT}
ENV PROXYIP=${PROXYIP}
ENV PROXYHOST=${PROXYHOST}
ENV PORTSERVER=${PORTSERVER}

# Instale o utilitário envsubst
RUN echo "PROXYIP=${PROXYIP} PORTSERVER=${PORTSERVER}"
RUN apt-get update && apt-get install -y gettext-base

# Crie o arquivo nginx.conf substituindo as variáveis de ambiente

CMD envsubst '$PROXYPORT $PROXYIP $PROXYHOST $PORTSERVER' < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf && nginx -g 'daemon off;'

