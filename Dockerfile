FROM node:22-slim
WORKDIR /workspace
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY package.json .
RUN npm install --production
COPY agent.js .
CMD ["node", "agent.js"]
