FROM node:12

COPY docker/*.sh /root/
RUN chmod 0755 /root/*.sh

WORKDIR /data

COPY . .

VOLUME /data

CMD /bin/bash /root/start.sh