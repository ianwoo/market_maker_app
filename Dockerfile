FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

# FROM nginx:1.21.0-alpine as production
ENV NODE_ENV production
# COPY --from=builder /app/build /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["npx", "serve", "build"]