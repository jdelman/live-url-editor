FROM nginx:1.22.1-alpine
ADD build/ /usr/share/nginx/html
EXPOSE 80