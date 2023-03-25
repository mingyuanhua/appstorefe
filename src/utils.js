const domain = 'https://aroundstore.uc.r.appspot.com';  

const handleResponseStatus = (response, errMsg) => {
  // destruct
  const {status, ok} = response;

  // for all fe be communication, found 401 once, expired or not working
  if (status === 401) {
    // remove old auth
    localStorage.removeItem("authToken");
    // browser api refresh, force user to signin
    window.location.reload();
    return;
  }

  if (!ok) {
    throw Error(errMsg);
  }
}

// export similar as public, if no export similar to private
// credential is passed by components
export const login = (credential) => {
  const url = `${domain}/signin`;

  // fetch result .then()
  // result of former step will be the parameter of next step
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // request body
    body: JSON.stringify(credential),
  }).then((response) => {
    // login only cares response 200 not care 401
    if (!response.ok) {
      throw Error("Fail to log in");
    }
    // .text() .json() depends on how backend returns
    // here use text b/c response is a token
    return response.text();
  }).then((token) => {
    localStorage.setItem("authToken", token);
  });
}

export const register = (credential) => {
  const url = `${domain}/signup`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credential),
  }).then((response) => {
    handleResponseStatus(response, "Fail to register");
  });
};

// data, file from component collected from user activities
export const uploadApp = (data, file) => {
  const authToken = localStorage.getItem("authToken");
  const url = `${domain}/upload`;

  const { title, description, price } = data;
  // json cannot handle file content transfer
  // so need FormData class from browser
  const formData = new FormData();
  // first param must be the same as the field in backend
  formData.append("title", title);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("media_file", file);
  
  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: formData,
  }).then((response) => {
    handleResponseStatus(response, "Fail to upload app");
  });
}

export const searchApps = (query) => {
  // use ? to make sure if query null, then query?.title is undefined
  // use ?? if undefined then ""
  const title = query?.title ?? "";
  const description = query?.description ?? "";

  // use query string instead of request body as the parameter for GET
  const authToken = localStorage.getItem("authToken");
  const url = new URL(`${domain}/search`);
  url.searchParams.append("title", title);
  url.searchParams.append("description", description);

  return fetch(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  }).then((response) => {
    handleResponseStatus(response, "Fail to search apps");

    // return object ui
    return response.json();
  });
};

// even though we used "POST", we didn't put params into Body
// we still used query to put params, in fact it should be a GET
export const checkout = (appId) => {
  const authToken = localStorage.getItem("authToken");
  const url = `${domain}/checkout?appID=${appId}`;

  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      handleResponseStatus(response, "Fail to checkout");

      // backend return the directed stripe url
      return response.text();
    })
    .then((redirectUrl) => {
      // front end same tab direct to the new url
      // global object window assigned to new value
      // window.open(redirectUrl) opens a new tab
      window.location = redirectUrl;
      // why direct to stripe, how can we go back the original?
      // stripe handles it, but the back url is from our backend
      // which is inside response.text() a long url
    });
};