// src/index.ts
import http from 'http';
import url from 'url';
import querystring from 'querystring';
import Shopify, { ApiVersion, AuthQuery } from '@shopify/shopify-api';
// Import our custom storage class
import RedisStore from './redis-store';

require('dotenv').config();

// Create a new instance of the custom storage class
const sessionStorage = new RedisStore();

const { API_KEY, API_SECRET_KEY, SCOPES, SHOP, HOST } = process.env

// Setup Shopify.Context with CustomSessionStorage
Shopify.Context.initialize({
  API_KEY,
  API_SECRET_KEY,
  SCOPES: [SCOPES],
  HOST_NAME: HOST,
  IS_EMBEDDED_APP: true,
    API_VERSION: ApiVersion.April21, // all supported versions are available, as well as "unstable" and "unversioned"
  // Pass the sessionStorage methods to pass into a new instance of `CustomSessionStorage`
  SESSION_STORAGE: new Shopify.Session.CustomSessionStorage(
    sessionStorage.storeCallback,
    sessionStorage.loadCallback,
    sessionStorage.deleteCallback,
  ),
});

async function onRequest(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
    const { headers, url: req_url } = request;
    const pathName: string | null = url.parse(req_url).pathname;
    const queryString: string = (String)(url.parse(req_url).query);
    const query: Record<string, any> = querystring.parse(queryString);
  
    if (pathName === '/') {
      // check if we're logged in/authorized
      const currentSession = await Shopify.Utils.loadCurrentSession(request, response);
      if(!currentSession) {
        // not logged in, redirect to login
        response.writeHead(302, { 'Location': `/login` });
          response.end();
          console.log('connected now');
          
      } else {
        // do something amazing with your application!
          console.log('next step');
          
      }
      return;
    } // end of if(pathName === '/')
  } // end of onRequest()
  
http.createServer(onRequest).listen(3000, () => {
      console.log(`> Ready on running`);
      
});
  