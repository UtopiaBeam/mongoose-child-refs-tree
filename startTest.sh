docker run -p 27017:27017 --name mongoose-plugin-database -d mongo:4
if [ "$1" == "--watch" ]; then
    yarn test:watch
else
    yarn test
fi
docker stop mongoose-plugin-database
docker rm mongoose-plugin-database