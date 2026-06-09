FROM node:26-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 1337
RUN npm run prisma:cd
CMD ["npm", "start"]