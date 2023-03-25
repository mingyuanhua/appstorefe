import {Button, Card, Form, Image, Input, List, message, Tabs, Tooltip, Typography} from "antd";
import { useEffect, useState } from "react";
import { searchApps, checkout } from "../utils";
import PostApps from "./PostApps";

const { TabPane } = Tabs;
const { Text } = Typography;
  
const BrowseApps = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  // 第一次来到也没的时候没有默认的搜索
  // 怎么在页面一渲染就trigger api call呢？放到类似DidMount里？用useEffect
  // 第二个参数一定要放空数组，就是类似DidMount运行
  // 刚到页面做一次什么参数都不传的搜索
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (query) => {
    setLoading(true);
    try {
      const resp = await searchApps(query);
      setData(resp || []);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 没有div这样的话需要有个空的作为饺子皮
  // 先填写Form这个component的props onFinish
  // button放在Form里面的时候需要再他外面先包一层Form.Item这个特殊的component包起来
  // 起到的作用是和Form component给链接起来
  // Button的属性必须要写的是type="primary" 代表蓝色的主题色
  // Button的底层用到的是html的原生button，Form的底层用到的是html的原生form
  // 底层代码要产生type=submit的动作，需要使用htmlType="submit"
  // Form.Item的props：label是之后展示给用户的文字，收集来的数据是object
  // 每个Form.Item决定了数据包括哪些，是name props
  // antd Form默认竖着排列，通过layout变成inline

  // List把数据给显示出来
  // renderItem重复的调用这个函数 action是放在每个card底部的东西
  // 为什么checkout不需要try catch finally？那是因为点了checkout就在别的应用里了
  // 当我们的前端代码看的query string的时候，?success=true，怎么读，怎么跳个消息？
  // 跳回来的时候在哪个component里做这一步呢？在APP里做这个事情，在什么时机去处理这个query string？
  // 也是didmount，和检查登录的逻辑拆开写清晰一点
  return (
    <>
      <Form onFinish={handleSearch} layout="inline">
        <Form.Item label="Title" name="title">
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button loading={loading} type="primary" htmlType="submit">
            Search
          </Button>
        </Form.Item>
      </Form>
      <List
        style={{ marginTop: 20 }}
        loading={loading}
        grid={{
          gutter: 16,
          xs: 1,
          sm: 3,
          md: 3,
          lg: 3,
          xl: 4,
          xxl: 4,
        }}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <Card
              key={item.id}
              title={
                <Tooltip title={item.description}>
                  <Text ellipsis={true} style={{ maxWidth: 150 }}>
                    {item.title}
                  </Text>
                </Tooltip>
              }
              extra={<Text type="secondary">${Number(item.price)/100}</Text>}
              actions={[
                <Button
                  shape="round"
                  type="primary"
                  onClick={() => checkout(item.id)}
                >
                  Checkout
                </Button>,
              ]}
            >
              <Image src={item.url} width="100%" />
            </Card>
          </List.Item>
        )}
      />
    </>
  );
};

const HomePage = () => {
  // tabs分页器 BrowseApps和PostApps两个tab的切换
  return (
    <Tabs defaultActiveKey="1" destroyInactiveTabPane={true}>
      <TabPane tab="Browse Apps" key="1">
        <BrowseApps />
      </TabPane>
      <TabPane tab="Post Apps" key="2">
        <PostApps />
      </TabPane>
    </Tabs>
  );
};

export default HomePage;