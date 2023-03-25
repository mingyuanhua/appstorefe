import { Layout, Dropdown, Menu, Button, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";
import HomePage from "./components/HomePage";

// layout来自于antd，这样就不用一堆div了
const { Header, Content } = Layout;

// App是最顶层的，需要维护一些global状态，颜色theme等
// 功能上global state就是用户登录的状态

const App = () => {
  // useState() is a hook!!!!!! 定义state时要用的state
  // 当component是用function定义的时候就需要也只能用hook来定义state
  // useState()小括号里是state的初始值，假设没有登录过
  // 左侧中括号之间永远填两个东西A和B，A是reader，B是setter
  const [authed, setAuthed] = useState();

  // 可以大胆地Assume只要有token，那么就是valid
  // 因为就算挂机了很久了，他总要做一些事情，发api返回状态
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    setAuthed(authToken !== null);
  }, []);
  // 那么这件事为什么要放到useEffect里呢？
  // 如果放在外面，setAuthed是个state状态的变化，相当于是re-render
  // 这样function就会再次执行，无限循环了
  // 这里是希望只做一次了，所以需要放到DidMount里面
  // 在函数里如何实现类似DidMount的时机呢？使用useEffect
  // [] 保证了保证了只做一次

  // Check to see if this is a redirect back from Checkout
  // window.location.search就是query string
  // 跳两次的原因：本地开发因为使用的是严格模式 所有所有component会Mount两次
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      message.success("Order placed!");
    }
  }, []);

  const handleLogOut = () => {
    localStorage.removeItem("authToken");
    setAuthed(false);
  };

  const handleLoginSuccess = () => {
    setAuthed(true);
  };
  
  const renderContent = () => {
    if (authed === undefined) {
      return <></>;
    }
  
    if (!authed) {
      // handleLoginSuccess修改的是App里login的state: authed
      // setAuthed(true)页面才会刷新一下 才能看到HomePage 否则看到的是LoginPage
      return <LoginForm onLoginSuccess={handleLoginSuccess} />;
    }
  
    return <HomePage />;
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" onClick={handleLogOut}>
        Log Out
      </Menu.Item>
    </Menu>
  );

  // 如果是登录状态才显示这段 dropdown就是类似下拉菜单 overlay就是下拉里的东西
  return (
    <Layout style={{ height: "100vh" }}>
      <Header style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "white" }}>
          App Store
        </div>
        {authed && (
          <div>
            <Dropdown trigger="click" overlay={userMenu}>
              <Button icon={<UserOutlined />} shape="circle" />
            </Dropdown>
          </div>
        )}
      </Header>
      <Content
        style={{ height: "calc(100% - 64px)", padding: 20, overflow: "auto" }}
      >
        {renderContent()}
      </Content>
    </Layout>
  );
};
// height + overflow auto 我们是想让字过多的时候会让浏览器显示滚动条
// 当content大多的时候会overflow

export default App;