FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p data uploads

EXPOSE 8080
ENV PORT=8080

CMD ["node", "server.js"]
