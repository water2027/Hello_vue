<template>
    <div class="star-pattern">
        <header class="bg-transparent text-white p-4">
            <div class="container mx-auto flex justify-between items-center">
                <h1 class="github">blog</h1>
                <nav>
                    <a @click="get_posts" class="p-2 text-white hover:text-gray-200">时间轴</a>
                    <a @click="tab_tags" class="p-2 text-white hover:text-gray-200">分类</a>
                    <a @click="get_fri" class="p-2 text-white hover:text-gray-200">友链</a>
                    <a href="./chat.html">AI</a>
                </nav>
            </div>
        </header>
        <main class="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 p-4 main-grid">
            <section v-if="turn" class="col-span-1 md:col-span-3">
                <article :hidden="htag" class="bg-white p-6 rounded-lg shadow-md mb-4"><button v-for="tag in tags"
                        :key="tag" class="p-2 text-white hover:text-gray-200 github" @click="get_tags(tag)">{{ tag
                        }}</button>
                </article>
                <a :hidden="hfriend" v-for="friend in fri" :href="friend.url">
                    <article>
                        <div class="bg-white p-6 rounded-lg shadow-md mb-4">
                            <h2 class="text-xl font-bold mb-2 gradient-text">{{ friend.name }}</h2>
                        </div>
                    </article>
                </a>
                <a :hidden="hposts" v-for="post in posts" :key="post.title" @click="toPost(post)">
                    <article class="bg-white p-6 rounded-lg shadow-md mb-4">
                        <h2 class="text-xl font-bold mb-2 gradient-text">{{ post.title }}</h2>
                        <h1 class="text-xl font-bold mb-2 dream">{{ post.jmjx }}</h1>
                        <div class="text-gray-600 text-sm sea"><span>{{ formatDate(post.created_at) }}</span></div>
                    </article>
                </a>
            </section>
            <section v-else class="col-span-1 md:col-span-3" :id="page">
                <article class="bg-white p-6 rounded-lg shadow-md mb-4" id="content">
                    <h1 class="gradient-text">{{ page.title }}</h1>
                    <p v-html="page.body"></p>
                </article>
                <textarea cols="10" rows="1" placeholder="不会真的有人填真名吧？" v-model="username"></textarea>
                <textarea cols="10" rows="1" placeholder="想说点什么吗？" v-model="userreply"></textarea>
                <button @click="sendreply(page.title)" class="click">点我留言，速</button>
                <div>
                    <article v-for="re in reply" :key="re.title" class="bg-white p-6 rounded-lg shadow-md mb-4"
                        id="article">
                        <h2 class="text-xl font-bold mb-2 gradient-text">{{ re.name }}</h2>
                        <p class="text-gray-600 text-sm dream">{{ re.reply }}</p>
                        <div class="text-gray-600 text-sm sea"><span>{{ formatDate(re.time) }}</span></div>
                        <button @click="del(re.name, re.reply, re.title)">删除</button>
                    </article>
                </div>
            </section>
            <aside class="col-span-1">
                <div class="bg-white p-4 rounded-lg shadow-md mb-4 flex items-center">
                    <img class="rounded-full h-16 w-16" src="./water.png" alt="Profile picture description">
                    <div class="ml-4">
                        <h3 class="font-bold rilo-text">Water</h3>
                        <p class="text-gray-600">摆烂，摆大烂</p>
                        <div>
                            <a href="https://github.com/water2027"><span class="fancy-text">我的GitHub</span></a>
                        </div>
                    </div>
                </div>
            </aside>
        </main>
        <footer class="bg-transparent text-white p-4">
            <div class="container mx-auto">
                <a href="https://github.com/water2027/Good_Bye_World" target="_blank"><span
                        class="github">本博客项目来源地址</span></a>
            </div>
        </footer>
    </div>
</template>

<script>

export default {
    data() {
        return {
            tags: ['闲谈', '技术', '更新'],
            fri: [
                {
                    "name": "Steamed Fresh",
                    "url": "https://steamedfresh.online/"
                }
            ],
            turn: true,
            hposts: false,
            htag: true,
            hfriend: true,
            posts: [],
            page: {
                "title": "",
                "body": ""
            },
            reply: [],
            username: "",
            userreply: ""
        }
    },
    methods: {
        get_posts() {
            this.fetchPosts();
            this.hposts = false;
            this.htag = true;
            this.hfriend = true;
            this.turn = true;
        },
        tab_tags() {
            //切换到分类页
            this.hposts = true;
            this.htag = false;
            this.hfriend = true;
            this.turn = true;
        },
        get_tags(tag) {
            //获取分类
            fetch('/api/get_post_by_tag?tag=' + encodeURIComponent(tag))
                .then(response => response.json())
                .then(data => {
                    this.posts = data;
                    this.hposts = false;
                    this.htag = false;
                    this.hfriend = true;
                })
                .catch(error => console.error('Error:', error));
        },
        get_fri() {
            //获取友链
            this.hposts = true;
            this.htag = true;
            this.hfriend = false;
            this.turn = true;
        },
        fetchPosts() {
            fetch('/api/posts')
                .then(response => response.json())
                .then(data => {
                    this.posts = data;
                })
                .catch(error => console.error('Error:', error));
        },
        formatDate(date) {
            const utcDate = new Date(date);
            return utcDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
        },
        toPost(post) {
            this.page.title = post.title;
            this.page.body = post.body;
            this.getreply(post.title);
            this.turn = false;
        },
        getreply(title) {
            fetch('/api/getreply?title=' + encodeURIComponent(title), {
                method: 'GET'
            })
                .then(response => response.json())
                .then(data => {
                    this.reply = data;
                    this.reply.reverse();
                });
        },
        del(name, reply, title) {
            fetch('/api/delreply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, reply, title }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('删除成功?');
                    this.getreply(title);
                })
                .catch((error) => {
                    console.log('失败了?' + error);
                });
        },
        sendreply(title) {
            let name = this.username;
            let reply = this.userreply;
            fetch('/api/reply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, name, reply }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('留言成功?');
                    this.getreply(title);
                })
                .catch((error) => {
                    console.log('失败了?' + error);
                });
        }
    },
    created() {
        this.fetchPosts();
    }
}
</script>

<style>
p {
    text-indent: 2em;
    line-height: 1.8;
    margin-top: 10px;
    margin-bottom: 10px;
    font-size: 18px;
    color: #333;
    font-weight: 600;
}

.article {
    background-color: #f5f5f5;
    /* 淡灰色背景 */
    font-family: 'SimSun', '宋体', serif;
}

#click {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}
</style>
