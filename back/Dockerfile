FROM node:26-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run prisma:generate
RUN npm run build
EXPOSE 1337
CMD ["npm", "start"]
