/* ============ Agent prompt management ============ */
const PMST={test:{n:'测试中',c:'run'},pending:{n:'待上线',c:'review'},live:{n:'使用中',c:'done'},retired:{n:'已下线',c:'todo'}};
const PMTYPE={run:'可运行',frag:'共享片段'};
const MODELS=['gpt-4o','gpt-4.1','gpt-5.4','claude-sonnet-4-6','gemini-2.5-pro'];
const SLOTS={
 gen:['{{品牌调性}}','{{活动Brief}}','{{禁用词}}','{{产品资料}}','{{平台}}','{{历史表现}}'],
 plan:['{{活动Brief}}','{{预算}}','{{渠道组合}}','{{排期}}','{{品牌调性}}'],
 pdp:['{{产品资料}}','{{类目规则}}','{{卖点排序}}','{{价格}}','{{品牌调性}}'],
 promoimg:['{{产品图}}','{{广告标语}}','{{创意方向}}','{{人群摘要}}','{{尺寸}}'],
 cs:['{{订单信息}}','{{会员等级}}','{{话术库}}','{{补偿上限}}','{{角色设定}}'],
 kol:['{{达人库}}','{{品牌目标}}','{{预算}}','{{黑名单}}','{{打分权重}}'],
 seo:['{{关键词}}','{{站内结构}}','{{历史表现}}','{{内链候选}}'],
 ad:['{{投放数据}}','{{阈值}}','{{人群包}}','{{活动阶段}}'],
 msg:['{{人群}}','{{触达场景}}','{{品牌调性}}','{{禁用词}}'],
 vid:['{{已批准方向}}','{{时长}}','{{比例}}','{{产品资料}}'],
 orch:['{{用户意图}}','{{可用Agent}}','{{知识库摘要}}','{{活动上下文}}']
};
const PSHARED=[
 {id:'ps-style',shared:true,n:'平台内容风格与规范提示词',ty:'frag',v:1,st:'live',model:null,by:'asher',at:'2026.07.08 06:07',note:'补充小红书标题长度上限与表情使用规范',use:['gen','plan','pdp','seo','msg'],slots:['{{平台}}','{{品牌调性}}','{{禁用词}}'],body:'以下是所有内容类产出必须遵守的平台规范，优先级高于单个场景的提示词。\n\n平台：{{平台}}\n品牌调性：{{品牌调性}}\n\n通用规则\n· 标题不超过平台上限，小红书 20 字、抖音 30 字。\n· 正文段落之间空一行，不使用连续感叹号。\n· 禁用词按 {{禁用词}} 全量校验，命中即停，不做近义替换。',hist:[{v:1,by:'asher',at:'2026.07.08',note:'补充小红书标题长度上限与表情使用规范'}]},
 {id:'ps-img',shared:true,n:'AI 生图提示词组',ty:'run',v:1,st:'live',model:'gemini-2.5-pro',by:'asher',at:'2026.03.03 08:05',note:'—',use:['gen','pdp','vid','promoimg'],slots:['{{产品图}}','{{创意方向}}','{{尺寸}}'],body:'根据产品参考图与创意方向生成图片提示词。\n\n参考图：{{产品图}}\n创意方向：{{创意方向}}\n输出尺寸：{{尺寸}}\n\n保持包装、瓶身颜色与品牌标识与参考图一致，不新增多余文字。',hist:[{v:1,by:'asher',at:'2026.03.03',note:'—'}]},
 {id:'ps-proj-new',shared:true,n:'创建 Project 提示词',ty:'run',v:1,st:'live',model:'gpt-4o',by:'asher',at:'2026.03.26 07:11',note:'—',use:['orch'],slots:['{{用户意图}}','{{活动上下文}}'],body:'把一句话意图拆解成一个可执行的 Project。\n\n用户意图：{{用户意图}}\n活动上下文：{{活动上下文}}\n\n信息不够先问，不猜；信息完整后再拆步骤。',hist:[{v:1,by:'asher',at:'2026.03.26',note:'—'}]},
 {id:'ps-proj-upd',shared:true,n:'更新 Project 提示词',ty:'run',v:1,st:'live',model:'gpt-4o',by:'cherry',at:'2026.04.13 09:46',note:'—',use:['orch'],slots:['{{用户意图}}','{{活动上下文}}'],body:'根据新的补充信息更新已有 Project 的计划。\n\n变更请求：{{用户意图}}\n\n已完成的步骤不重跑；计划版本号递增。',hist:[{v:1,by:'cherry',at:'2026.04.13',note:'—'}]}
];
const PROMPTS=[
 {id:'pg-gen-now',ag:'gen',n:'即时内容创作提示词组',ty:'run',v:5,st:'live',model:'gpt-5.4',by:'asher',at:'2026.06.10 08:06',note:'把“低预算”从卖点改成约束，避免和专业修护定位打架',runs:142,ed:18,slots:SLOTS.gen,body:'你是 XDIGATE 的内容生成 Agent。按品牌调性与产品资料，为 {{平台}} 生成可直接发布的种草图文。\n\n品牌调性：{{品牌调性}}\n产品资料：{{产品资料}}\n\n一次输出 3 个方向，每个方向给出标题、正文、话题标签、配图建议。全文经过 {{禁用词}} 校验。',hist:[{v:5,by:'asher',at:'2026.06.10',note:'把“低预算”从卖点改成约束'},{v:4,by:'asher',at:'2026.05.28',note:'三方向改为必须输出'},{v:3,by:'asher',at:'2026.04.18',note:'统一标题、正文和话题标签的输出结构'},{v:2,by:'asher',at:'2026.03.20',note:'增加品牌调性与产品资料变量'},{v:1,by:'asher',at:'2026.02.12',note:'创建基础社媒内容生成模板'}]},
 {id:'pg-gen-camp',ag:'gen',n:'活动图片生成提示词组',ty:'run',v:4,st:'live',model:'gpt-4.1',by:'asher',at:'2026.06.10 08:06',note:'大促期标题前置活动标识',runs:96,ed:24,slots:SLOTS.gen,body:'按活动 Brief 生成大促期内容。\n\n活动 Brief：{{活动Brief}}\n历史表现：{{历史表现}}\n\n标题前置活动标识，正文第一屏出现利益点。',hist:[{v:4,by:'asher',at:'2026.06.10',note:'大促期标题前置活动标识'},{v:3,by:'asher',at:'2026.05.22',note:'增加历史表现参考与活动复盘要求'},{v:2,by:'asher',at:'2026.04.16',note:'补充活动 Brief 与发布平台变量'},{v:1,by:'asher',at:'2026.03.08',note:'创建活动内容基础生成模板'}]},
 {id:'pg-gen-camp-pending',ag:'gen',n:'活动图片生成提示词组',ty:'run',v:5,st:'pending',model:'gpt-5.4',by:'dudu',at:'刚刚',note:'补充不同活动阶段的内容节奏与平台表达要求',runs:0,ed:0,slots:SLOTS.gen,body:'你是 XDIGATE 的活动内容生成 Agent。根据 {{活动Brief}}、{{品牌调性}} 与 {{历史表现}}，为 {{平台}} 生成活动期可直接发布的内容。\n\n先识别活动阶段：预热、爆发或返场，再匹配对应的内容目标与表达节奏。一次输出 3 个方向，每个方向包含标题、正文、话题标签与配图建议。标题需要前置活动标识，正文第一屏明确核心利益点，并通过 {{禁用词}} 校验。',hist:[{v:5,by:'dudu',at:'刚刚',note:'补充不同活动阶段的内容节奏与平台表达要求'},{v:4,by:'asher',at:'2026.06.10',note:'大促期标题前置活动标识'}]},
 {id:'pg-gen-test',ag:'gen',n:'即时内容创作提示词组',ty:'run',v:6,st:'test',model:'claude-sonnet-4-6',by:'dudu',at:'2026.09.12 16:20',note:'',runs:11,ed:9,slots:SLOTS.gen,body:'你是 XDIGATE 的内容生成 Agent。按品牌调性与产品资料，为 {{平台}} 生成可直接发布的种草图文。\n\n品牌调性：{{品牌调性}}\n产品资料：{{产品资料}}\n\n一次输出 3 个方向，每个方向给出标题、正文、话题标签、配图建议。全文经过 {{禁用词}} 校验。',hist:[{v:6,by:'dudu',at:'2026.09.12',note:'试 claude-sonnet-4-6'}]},
 {id:'pg-gen-asher-test',ag:'gen',n:'即时内容创作提示词组',ty:'run',v:7,st:'test',model:'gpt-5.4',by:'asher',at:'刚刚',note:'测试不同平台的语气约束与标题结构',runs:0,ed:0,testRuns:3,slots:SLOTS.gen,body:'你是 XDIGATE 的内容生成 Agent。根据品牌调性与产品资料，为 {{平台}} 生成可以直接发布的种草图文。\n\n品牌调性：{{品牌调性}}\n产品资料：{{产品资料}}\n活动信息：{{活动Brief}}\n\n先判断平台内容习惯，再输出 3 个差异明确的创作方向。每个方向包含标题、正文、话题标签和配图建议，并使用 {{历史表现}} 调整表达重点。全文必须通过 {{禁用词}} 校验。',hist:[{v:7,by:'asher',at:'刚刚',note:'测试不同平台的语气约束与标题结构'}]},
 {id:'pg-gen-old',ag:'gen',n:'社媒正文提示词组（旧）',ty:'run',v:2,st:'retired',model:'gpt-4o',by:'cherry',at:'2026.04.02 09:00',note:'被“即时内容创作提示词组”替代',runs:0,ed:0,slots:SLOTS.gen,body:'根据品牌资料生成社媒正文。',hist:[{v:2,by:'cherry',at:'2026.04.02',note:'被新版本替代'}]},
 {id:'pg-plan',ag:'plan',n:'活动策划提示词组',ty:'run',v:7,st:'live',model:'claude-sonnet-4-6',by:'asher',at:'2026.06.09 09:43',note:'补充分阶段预算与渠道责任',runs:24,ed:22,slots:SLOTS.plan,body:'生成活动主题、排期、预算分配与渠道分工。\n活动 Brief：{{活动Brief}}\n预算：{{预算}}\n渠道：{{渠道组合}}\n排期：{{排期}}',hist:[{v:7,by:'asher',at:'2026.06.09',note:'补充分阶段预算与渠道责任'}]},
 {id:'pg-pdp',ag:'pdp',n:'详情页生成提示词组',ty:'run',v:6,st:'live',model:'gpt-5.4',by:'Brooks',at:'2026.08.03 11:20',note:'先生成规划表，再生成详情页内容',runs:57,ed:41,slots:SLOTS.pdp,body:'根据 {{产品资料}} 与 {{类目规则}} 生成详情页规划。卖点顺序：{{卖点排序}}。',hist:[{v:6,by:'Brooks',at:'2026.08.03',note:'先生成规划表'}]},
 {id:'pg-img',ag:'promoimg',n:'推广图生成提示词组',ty:'run',v:3,st:'live',model:'gemini-2.5-pro',by:'Sam',at:'2026.08.11 15:10',note:'补充参考图一致性要求',runs:24,ed:12,slots:SLOTS.promoimg,body:'依据 {{产品图}}、{{广告标语}} 与 {{创意方向}} 生成 {{尺寸}} 推广图。',hist:[{v:3,by:'Sam',at:'2026.08.11',note:'补充参考图一致性要求'}]},
 {id:'pg-cs',ag:'cs',n:'客服回复提示词组',ty:'run',v:9,st:'live',model:'gpt-4.1',by:'Ariel',at:'2026.08.02 09:40',note:'补充补偿上限校验',runs:1284,ed:12,slots:SLOTS.cs,body:'结合 {{订单信息}}、{{会员等级}} 和 {{话术库}} 生成客服回复，补偿不得超过 {{补偿上限}}。',hist:[{v:9,by:'Ariel',at:'2026.08.02',note:'补充补偿上限校验'}]},
 {id:'pg-kol',ag:'kol',n:'达人匹配提示词组',ty:'run',v:4,st:'live',model:'gpt-4.1',by:'Sophie',at:'2026.07.21 14:00',note:'加入冷却期与黑名单校验',runs:14,ed:29,slots:SLOTS.kol,body:'基于 {{达人库}}、{{品牌目标}} 与 {{打分权重}} 输出达人名单，规避 {{黑名单}}。',hist:[{v:4,by:'Sophie',at:'2026.07.21',note:'加入冷却期与黑名单校验'}]},
 {id:'pg-seo',ag:'seo',n:'SEO 内容提示词组',ty:'run',v:5,st:'live',model:'gpt-5.4',by:'Sophie',at:'2026.07.12 10:30',note:'补充内链候选规则',runs:33,ed:9,slots:SLOTS.seo,body:'围绕 {{关键词}} 生成文章结构与正文，参考 {{站内结构}} 和 {{内链候选}}。',hist:[{v:5,by:'Sophie',at:'2026.07.12',note:'补充内链候选规则'}]},
 {id:'pg-ad',ag:'ad',n:'广告优化提示词组',ty:'run',v:4,st:'live',model:'gpt-4.1',by:'Brooks',at:'2026.07.18 08:50',note:'低曝光计划不自动暂停',runs:88,ed:12,slots:SLOTS.ad,body:'读取 {{投放数据}} 与 {{阈值}}，给出暂停、放量或继续观察建议。',hist:[{v:4,by:'Brooks',at:'2026.07.18',note:'低曝光计划不自动暂停'}]},
 {id:'pg-msg',ag:'msg',n:'消息内容提示词组',ty:'run',v:3,st:'live',model:'gpt-4.1',by:'Ariel',at:'2026.06.28 12:10',note:'增加触达场景约束',runs:73,ed:26,slots:SLOTS.msg,body:'根据 {{人群}} 与 {{触达场景}} 生成消息文案，遵守 {{品牌调性}} 与 {{禁用词}}。',hist:[{v:3,by:'Ariel',at:'2026.06.28',note:'增加触达场景约束'}]},
 {id:'pg-orch',ag:'orch',n:'任务编排提示词组',ty:'run',v:8,st:'live',model:'gpt-5.4',by:'Shlomi',at:'2026.08.09 07:30',note:'缺关键信息时先澄清',runs:318,ed:0,slots:SLOTS.orch,body:'把 {{用户意图}} 拆成可执行计划，从 {{可用Agent}} 中分派。信息不足时先提问。',hist:[{v:8,by:'Shlomi',at:'2026.08.09',note:'缺关键信息时先澄清'}]}
];

// Prototype sample copy for inspecting the continuous editor with long content.
// The screenshot supplies section names only; these bodies are illustrative.
const PM_CONTENT_PREVIEW=[
 {name:'主提示词',group:'主提示词',text:`你是 XDIGATE 的内容生成 Agent，负责将品牌资料、产品信息与活动需求整理成适合 {{平台}} 的种草图文。你的目标是让读者看懂产品适合谁、解决什么问题，以及在什么场景下值得进一步了解，而不是堆砌卖点或生成夸张的营销口号。

开始创作前，请读取 {{品牌调性}}、{{产品资料}} 与 {{活动Brief}}，区分已经确认的事实、品牌希望强调的表达方向，以及仍然缺失的信息。参考 {{历史表现}} 判断哪些切入点值得保留，但不要把历史表现写成当前产品的效果保证。

一次提出 3 个差异明确的方向：一个从真实使用场景切入，一个从读者的具体问题切入，一个从产品特点与选择理由切入。每个方向均包含 title、hook、body、cta、hashtags 和配图建议，使用下方统一约束。不要只是替换形容词或调整句序来伪装成不同方向。

资料不足时，不要补造价格、成分浓度、功效数据、资质或用户反馈。请明确指出缺失信息，并说明它影响哪一部分内容。如果信息足以完成其他部分，可以先输出有依据的内容，把待确认项放到发布前检查中。`},
 {name:'板块产出要求-title',group:'片段',text:`标题需要在一眼之内传达这篇内容的核心价值。优先使用“具体场景 + 实际问题”或“适用人群 + 选择理由”的结构，让读者知道为什么值得点开，而不是先罗列品牌名和产品全称。

为每个创作方向给出 2 个标题候选，并标明推荐项。候选之间需要有真正不同的切入点：一个突出使用场景，另一个突出选择标准。标题以自然语言表达，避免生硬的关键词串联。

标题长度遵循 {{平台}} 的限制；在本示例中，小红书控制在 20 个字以内，抖音控制在 30 个字以内。不要使用“全网第一”“百分百有效”“闭眼买”等无法证明的绝对化表述，也不要把疑问句写成效果承诺。`},
 {name:'板块产出要求-hook',group:'片段',text:`开头用 1—2 句话建立阅读动机，先呈现读者能够理解的具体情境，再说明接下来会回答的问题。开头必须与标题承接，不能标题讲选购、第一段却突然转为活动促销。

可以从日常困扰、使用时机或选择难点展开，但不要替读者制造焦虑。不要虚构“我用了三个月”“朋友都来问”等第一人称体验，除非 {{产品资料}} 中确实提供了可引用的真实材料。

示例表达方式：与其泛泛地说“换季必备”，不如解释换季时读者在意的使用感、搭配习惯或护理步骤。本段只负责把问题说清楚，不需要一次讲完所有卖点。`},
 {name:'板块产出要求-body',group:'片段',text:`正文围绕一个核心问题展开，不要同时塞入所有产品优势。建议按“场景与需求 → 产品特点 → 使用或选择建议 → 适用边界”的顺序组织，让每一段都推进一个明确的信息点。

将 {{产品资料}} 中可确认的事实转换为读者听得懂的语言。介绍产品特点时，同时交代它与使用场景的关系；介绍成分或技术时，不要擅自推导医学效果。专业名词首次出现时，用一句简短解释帮助理解。

使用 3—5 个自然段，每段 2—4 句话。重要信息可以单独成段，但不要每句话都换行，也不要将正文写成连续的口号。品牌定位与 {{品牌调性}} 保持一致，低预算只作为创作约束，不当作产品的价值判断。

如果存在明显的适用条件、使用顺序或不适用情况，请如实说明。没有资料支持的比较，不写“优于其他品牌”；没有真实案例支持的结果，不写“所有人都适合”。`},
 {name:'板块产出要求-cta',group:'片段',text:`结尾提供一个轻量、明确的下一步，只保留一个主要动作。根据内容目标，可邀请读者了解完整资料、查看使用说明、分享自己的选择标准或收藏以便之后参考。

CTA 必须与前文的问题自然衔接。知识型内容优先鼓励交流和了解，活动型内容只有在 {{活动Brief}} 提供有效信息时才引导查看活动，不自行添加优惠、库存或截止时间。

避免重复施压，不用“错过后悔”“最后机会”等制造紧迫感的句式。官方购买渠道、页面地址或咨询方式未提供时，不编造链接，也不暗示已经存在可点击的入口。`},
 {name:'板块产出要求-hashtags',group:'片段',text:`每个方向提供 3—5 个与内容直接相关的话题标签，按“主题 → 使用场景 → 产品类别 → 品牌”的顺序排列。标签需要帮助读者理解内容归属，而不是占据正文的大部分空间。

品牌名称与品类名称以 {{产品资料}} 为准，不创建看起来像官方活动的标签。不加入与产品无关的热门话题，不使用疾病治疗、夸张功效或未经确认的认证作为标签。

同一方向内不重复近义标签。输出 hashtags 时使用纯文本标签列表，具体是否带井号按下方“话题标签输出规则”处理。`},
 {name:'正文字数约束',group:'片段',text:`本预览示例的正文建议控制在 300—500 个中文字符，标题、标签和内部检查说明不计入正文。用户或 {{活动Brief}} 明确指定篇幅时，以明确需求为准，并同步调整段落数量。

不要为了凑字数重复同一个卖点，也不要删掉必要的使用条件来压缩篇幅。信息较多时优先保留核心问题、事实依据与使用建议，将次要背景合并成短句。

完成后检查每段是否有新信息。若两段表达相同含义，请合并；若某一句删掉后不影响理解，请优先精简。字数限制是阅读体验约束，不是替代事实完整性的理由。`},
 {name:'微博短句押韵要求',group:'片段',text:`仅在 {{平台}} 为微博且用户需要短句表达时启用本段，其他平台不强制押韵。短句以清楚、自然为先，允许轻微节奏感，不为了尾音一致改变事实或产品名称。

可以使用长度相近的两句表达形成呼应，但避免整篇口号化。押韵句之后仍需要提供具体信息，让读者知道产品特点和适用场景，不能只留下情绪化表达。

如果合适的韵脚会导致语义生硬，请直接使用自然句式。不要用网络梗替代品牌原有语气，也不要为了押韵加入未经资料支持的效果描述。`},
 {name:'平台风格规范',group:'片段',text:`根据 {{平台}} 调整表达，而不是把同一篇文案原样复制到所有渠道。小红书侧重真实场景与清晰经验结构；抖音侧重短句、直接的信息推进；微博侧重可独立理解的观点与简洁表达。

所有平台都必须遵守 {{品牌调性}}。语气亲切不等于装熟，专业不等于堆砌术语，简洁不等于省略条件。避免无意义的感叹号、重复称呼和过度拟人化的销售话术。

平台未明确时，使用中性的图文表达，并标记“发布平台待确认”。不要擅自选择平台专属的格式、标签数量或互动方式。`},
 {name:'展示规则',group:'片段',text:`每个方向按固定顺序展示：方向说明、标题候选、开头 hook、正文 body、行动引导 cta、话题标签 hashtags、配图建议。各部分用清晰的小标题隔开，正文内部保持自然段。

配图建议说明画面主体、构图重点和要传达的信息，不自动承诺素材已经存在。产品包装、颜色和品牌标识以提供的资料为准，不随意增加证书、检测标识或对比结果。

面向读者的成稿与内部检查说明分开。不要把“请插入图片”“这里补充数据”等编辑占位语混进可发布正文；待确认项统一放在最后的发布前检查中。`},
 {name:'话题标签输出规则',group:'片段',text:`标签单独放在正文之后，不穿插在句子中。需要井号格式的平台，为每个标签增加一个前缀井号，并以空格分隔；不需要井号的平台，以清晰的文本列表展示。

标签不得重复，不包含多余标点或完整句子。不要一次输出大量相近关键词来追求覆盖率，也不要借用不相关的热门事件。

最终检查标签与正文是否一致：正文没有涉及的场景不加标签，未确认的品牌合作不加活动标签，禁用词命中的标签必须删除，不能仅更换一个字后继续使用。`},
 {name:'表情符号输出规则',group:'片段',text:`表情符号用于辅助分段或强调轻量信息，不替代关键事实、警示和使用说明。本示例每个方向最多使用 3 个；品牌语气偏正式或用户明确不需要时，全部省略。

不要每句话都加表情，不连续重复同一个符号，不用夸张表情制造效果暗示。标题是否使用表情，需要同时符合平台习惯与 {{品牌调性}}，不默认强制添加。

输出前统一检查 {{禁用词}}、未经证实的效果描述、资料缺失项与格式要求。以上文本仅用于编辑器长内容预览，正式上线前仍需由业务负责人审核。`}
];
PROMPTS.filter(p=>p.n==='即时内容创作提示词组').forEach(p=>{
 const previousBlocks=promptBodyBlocks(p.body);
 const compliance='所有内容必须基于已提供的品牌与产品资料。不要虚构检测结果、用户反馈、资质和效果数据。发布前按 {{禁用词}} 完整检查；资料缺失时明确标注待确认信息。';
 p.blocks=[compliance,...PM_CONTENT_PREVIEW.map(block=>block.text),previousBlocks[2]||'',previousBlocks[3]||''];
 p.body=p.blocks.join('\n\n');
 p.blockMeta=[{name:'广告合规规则',group:'片段'},...PM_CONTENT_PREVIEW.map(({name,group})=>({name,group})),{name:'任务与素材',group:'主提示词'},{name:'页面结构与视觉要求',group:'片段'}];
 p.sectionBlocks={shared:[0],direction:PM_CONTENT_PREVIEW.map((_,i)=>i+1),layout:[13,14],image:[],revision:[]};
 p.previewSection='direction';
});
function allPrompts(){return PROMPTS.concat(PSHARED)}
function findPrompt(id){return allPrompts().find(p=>p.id===id)}
function promptsOf(id){return PROMPTS.filter(p=>p.ag===id)}
function sharedFor(id){return PSHARED.filter(p=>p.st==='live'&&(p.use||[]).includes(id))}
function livePrompt(id){return PROMPTS.find(p=>p.ag===id&&p.st==='live')}
function pendingPromptCount(){return allPrompts().filter(p=>p.st==='pending').length}
function agentAttentionCount(){return RECIPES.filter(r=>r.attn).length+pendingPromptCount()}
function promptCurrentName(){const user=U[currentUser()]||U.du;return user.n}
function isPromptCreator(p){return String(p.by||'').toLowerCase()===promptCurrentName().toLowerCase()}
function isPromptReviewer(){return currentUser()==='br'}
function promptOwner(){return 'Brooks'}
function promptAgentName(p){if(p.shared)return (p.use||[]).length+' 个 Agent 引用';const a=REG.find(x=>x.id===p.ag);return a?a.nick:p.ag}
function slotsUsed(body){return [...new Set((String(body).match(/\{\{[^}]+\}\}/g)||[]))]}
function slotPalette(p){return p.shared?(p.slots||[]):(SLOTS[p.ag]||p.slots||[])}
function badSlots(p,body){const pal=slotPalette(p);return slotsUsed(body).filter(s=>!pal.includes(s))}

vAgents=function(){
 if(S.atab===undefined)S.atab=0;if(S.adom===undefined)S.adom='全部';if(S.alv===undefined)S.alv='全部';
 const agentTabs=[{index:0,permission:'agent.registry',label:`Agent 登记处${pendingPromptCount()?`<span class="kb-tab-alert num">${pendingPromptCount()}</span>`:''}`},{index:1,permission:'agent.recipes',label:`配方 ${RECIPES.filter(r=>!r.cad).length}`},{index:2,permission:'agent.routines',label:`例行 ${RECIPES.filter(r=>r.cad).length}${RECIPES.filter(r=>r.attn).length?`<span class="kb-tab-alert num">${RECIPES.filter(r=>r.attn).length}</span>`:''}`},{index:3,permission:'agent.prompts',label:`共享提示词 ${PSHARED.length}`}].filter(tab=>permissionHasPage(tab.permission));
 if(!agentTabs.some(tab=>tab.index===S.atab))S.atab=agentTabs[0]?.index||0;
 const doms=['全部','内容','电商','用户运营','KOL','B2B','平台'],levels=['全部','M1','M2','M3'];
 const list=REG.filter(a=>(S.adom==='全部'||a.dom===S.adom)&&(S.alv==='全部'||LV[a.lv].k===S.alv)),live=REG.filter(a=>a.b==='live').length;
 return `<div class="wrap"><div class="eyebrow">平台 · Agents</div><h1>Agents</h1><div class="sub">这里是登记处，不是工作台。每个 agent 的自主级别、归属、成本和产出类型都在这里定——工作永远发生在「工作」里。</div>
 <div class="daystrip"><span class="sm"><span class="odot on"></span> 在线 <b class="num">${REG.filter(a=>ONLINE[a.id]).length}</b> · 共 <b class="num">${REG.length}</b> 个 · 已上线 <b class="num">${live}</b> · 开发中 <b class="num">${REG.filter(a=>a.b==='dev').length}</b> · 规划中 <b class="num">${REG.filter(a=>a.b==='plan').length}</b></span></div>
 <div class="bar"><div class="seg">${agentTabs.map(tab=>`<button class="${S.atab===tab.index?'on':''}" onclick="S.atab=${tab.index};render()">${tab.label}</button>`).join('')}</div>
 ${S.atab===0?`<div class="seg">${doms.map(d=>`<button class="${S.adom===d?'on':''}" onclick="S.adom='${d}';render()">${d}</button>`).join('')}</div><div class="seg">${levels.map(l=>`<button class="${S.alv===l?'on':''}" onclick="S.alv='${l}';render()">${l}</button>`).join('')}</div>`:''}</div>
 ${S.atab===0?list.map(agRow).join(''):S.atab===1?recipesOnly():S.atab===2?routinesOnly():sharedPromptsView()}</div>`;
};

drawAgent=function(){
 const a=REG.find(x=>x.id===S.ag);if(!a)return;const tabs=['概览','提示词','配置','最近运行'];const body=[agOv(a),agPrompts(a),agConfig(a),agRuns(a)][S.agtab]||agOv(a);
 $('dw').innerHTML=`<div class="dw-h"><button class="ib" onclick="closeDw()"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>${AV(a.id,30)}<div style="flex:1;min-width:0"><div class="ty">${a.dom}</div><h3>${a.nick}</h3></div><span class="st ${BS[a.b].c}">${BS[a.b].n}</span></div>
 <div class="dw-tabs">${tabs.map((t,i)=>`<button class="${S.agtab===i?'on':''}" onclick="S.agtab=${i};drawAgent()">${t}</button>`).join('')}</div><div class="dw-b">${body}</div><div class="dw-f">${S.agtab===2?`<button class="btn" onclick="toast('已保存 Agent 配置')">保存</button>`:S.agtab===1?`<span style="font-size:var(--fs-xs);color:var(--t3)">编辑与试跑不用找开发 · 上线要 ${a.own} 批准</span>`:a.b==='live'&&ONLINE[a.id]?`<button class="btn" onclick="openActivate('${a.id}')">立即运行</button>`:''}<span style="margin-left:auto;font-family:'Sora';font-size:var(--fs-xs);color:var(--t3)">${LV[a.lv].k}</span></div>`;
};

function agPrompts(a){
 const mine=promptsOf(a.id),shared=sharedFor(a.id),slots=SLOTS[a.id]||[],states=['live','test','pending','retired'];
 const counts=Object.fromEntries(states.map(k=>[k,mine.filter(p=>p.st===k).length]));
 S.pmPromptFilter=S.pmPromptFilter||{};
 if(!states.includes(S.pmPromptFilter[a.id]))S.pmPromptFilter[a.id]='live';
 const active=S.pmPromptFilter[a.id],visible=mine.filter(p=>p.st===active),activeName=PMST[active].n;
 return `<div class="pm-filterbar" role="tablist" aria-label="提示词状态">${states.map(k=>`<button class="${active===k?'on':''}" role="tab" aria-selected="${active===k}" onclick="S.pmPromptFilter['${a.id}']='${k}';drawAgent()"><span>${PMST[k].n}</span><span class="pm-filter-count">${counts[k]}</span></button>`).join('')}</div>
 ${visible.length?visible.map(p=>pmRow(p,false)).join(''):`<div class="allclear pm-empty">暂无${activeName}的提示词。</div>`}
 <div class="bar" style="margin:var(--sp-2) 0 14px"><span class="spacer"></span><button class="btn ghost sm" onclick="newPrompt('${a.id}')">＋ 新建提示词</button></div>${shared.length?`<div style="font-size:var(--fs-xs);font-weight:700;color:var(--t1);margin:var(--sp-4) 0 7px">引用的共享提示词 <span style="font-weight:400;color:var(--t3)">· 在「共享提示词」里维护，改动会同时影响其他 Agent</span></div>${shared.map(p=>pmRow(p,true)).join('')}`:''}${slots.length?`<div style="font-size:var(--fs-xs);font-weight:700;color:var(--t1);margin:var(--sp-4) 0 7px">可用变量槽 <span style="font-weight:400;color:var(--t3)">· 由代码填充，需要新槽位要找开发加</span></div><div class="pm-slots">${slots.map(s=>`<span class="pm-slot">${esc(s)}</span>`).join('')}</div>`:''}`
}
function pmRow(p,isRef){const st=PMST[p.st];return `<button class="pmrow ${isRef?'ref':''}" onclick="openPrompt('${p.id}')"><span class="pmv">v${p.v}</span><span class="pmb"><span class="pmt">${esc(p.n)}<span class="st ${st.c}">${st.n}</span>${p.ty==='frag'?'<span class="chip mut">共享片段</span>':''}${isRef?`<span class="chip dom">被 ${(p.use||[]).length} 个 Agent 引用</span>`:''}</span><span class="pmm">${p.model?`<span class="pmmodel">${p.model}</span>`:'<span class="pmmodel none">无直接模型 · 被其他提示词组合调用</span>'} · ${p.by} · ${p.at}${p.st==='live'&&p.runs?` · 已跑 <span class="num">${p.runs}</span> 次 · 编辑率 <span class="num">${p.ed}%</span>`:''}</span><span class="pmm" style="color:var(--t2)">${p.note&&p.note!=='—'?'改动理由(备注)：'+esc(p.note):'<span style="color:var(--danger-fg)">这一版没写改动理由(备注)</span>'}</span></span></button>`}
function sharedPromptsView(){
 const states=['live','test','pending','retired'],counts=Object.fromEntries(states.map(k=>[k,PSHARED.filter(p=>p.st===k).length]));
 if(!states.includes(S.pmSharedFilter))S.pmSharedFilter='live';
 const active=S.pmSharedFilter,visible=PSHARED.filter(p=>p.st===active),activeName=PMST[active].n;
 return `<div class="note" style="margin-bottom:var(--sp-3)">共享提示词不属于任何单个 Agent。改一版，所有引用它的 Agent 下次运行就一起变——上线审批比单个 Agent 的提示词更重。</div><div class="bar" style="margin:0 0 14px"><span class="chip mut">${PSHARED.length} 条</span><span class="chip mut">${PSHARED.filter(p=>p.ty==='frag').length} 个共享片段</span><span class="spacer"></span><button class="btn sm" onclick="newPrompt(null)">＋ 新建共享提示词</button></div><div class="pm-filterbar" role="tablist" aria-label="共享提示词状态">${states.map(k=>`<button class="${active===k?'on':''}" role="tab" aria-selected="${active===k}" onclick="S.pmSharedFilter='${k}';render()"><span>${PMST[k].n}</span><span class="pm-filter-count">${counts[k]}</span></button>`).join('')}</div>${visible.length?visible.map(p=>pmRow(p,true)).join(''):`<div class="allclear pm-empty">暂无${activeName}的共享提示词。</div>`}`
}

function promptBodyBlocks(body){const blocks=String(body||'').split(/\n\s*\n/).map(text=>text.trim()).filter(Boolean);return blocks.length?blocks:['']}
function promptBlockMeta(text,index,total){const value=String(text||'');if(index===0)return{group:'基础设定',name:'主提示词'};if(/品牌调性|产品资料|活动\s*Brief|历史表现|平台：|创意方向|参考图|用户意图|活动上下文/.test(value))return{group:'输入信息',name:'品牌、产品与任务资料'};if(/输出|生成|标题|正文|话题标签|配图建议|规则|校验|保持/.test(value))return{group:'生成规则',name:index===total-1?'输出格式与约束':'生成要求'};return{group:'提示词板块',name:`内容板块 ${index+1}`}}
const PM_PROMPT_SECTIONS=[{id:'shared',name:'全程共用片段'},{id:'direction',name:'创意方向'},{id:'layout',name:'分屏规划'},{id:'image',name:'逐屏生图'},{id:'revision',name:'图文修订'}];
const PM_PROMPT_SECTION_BLOCKS={shared:[0],direction:[1],layout:[2,3],image:[],revision:[]};
function pmSectionBlockIndexes(d){return (d.sectionBlocks||PM_PROMPT_SECTION_BLOCKS)[d.sectionTab||'shared']||[]}
function pmSectionBlockMeta(d,text,index,total){if(d.blockMeta?.[index])return d.blockMeta[index];const section=d.sectionTab||'shared';if(section==='shared')return{group:'片段',name:'广告合规规则'};if(section==='direction')return{group:'主提示词',name:'三套方向与配色'};if(section==='layout')return index===2?{group:'主提示词',name:'任务与素材'}:{group:'片段',name:'页面结构与视觉要求'};return promptBlockMeta(text,index,total)}
function openPrompt(id){const p=findPrompt(id);if(!p)return;const note=p.note&&p.note!=='—'?p.note:'';S.pm={id,name:p.n,body:p.body,blocks:(p.blocks||promptBodyBlocks(p.body)).slice(),sectionTab:p.previewSection||'shared',sectionBlocks:p.sectionBlocks,blockMeta:p.blockMeta,blockOpen:0,model:p.model,note,originalName:p.n,originalBody:p.body,originalModel:p.model,originalNote:note,lastSavedAt:p.savedAt||p.at||'',dirty:false,tab:0,slotsOpen:false,reasonOpen:false,runMode:'full',chat:[]};pmRestoreConversationView();drawPrompt();$('mod').classList.add('on')}
function pmSet(k,v){if(!S.pm)return;S.pm[k]=v;S.pm.dirty=S.pm.name!==S.pm.originalName||S.pm.body!==S.pm.originalBody||S.pm.model!==S.pm.originalModel||S.pm.note!==S.pm.originalNote;pmDirtyState()}
function pmDirtyState(){if(!S.pm)return;const p=findPrompt(S.pm.id),unsaved=!!(p&&p.isNew)||S.pm.dirty,b=$('pm-dirty'),reset=$('pm-reset');if(b){b.hidden=false;b.style.display='';b.className='chip '+(unsaved?'pm-dirty':'pm-saved');b.textContent=unsaved?'未保存':'最近保存 '+(S.pm.lastSavedAt||'刚刚')}if(reset)reset.disabled=!S.pm.dirty}
function promptSaveTime(){const d=new Date(),pad=n=>String(n).padStart(2,'0');return d.getFullYear()+'.'+pad(d.getMonth()+1)+'.'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes())}
function promptFamily(p){return p.family||(p.shared?'shared|':'agent|'+p.ag+'|')+p.n}
function promptVersions(p){const family=promptFamily(p);return allPrompts().filter(x=>promptFamily(x)===family)}
function pendingPromptVersion(p){return promptVersions(p).find(x=>x.st==='pending')||null}
function otherPendingPromptVersion(p){const pending=pendingPromptVersion(p);return pending&&pending.id!==p.id?pending:null}
function promptNameConflict(p,name){const normalized=String(name||'').trim().toLocaleLowerCase();if(!normalized)return false;const list=p.shared?PSHARED:PROMPTS.filter(x=>x.ag===p.ag);return list.some(x=>x.id!==p.id&&String(x.n||'').trim().toLocaleLowerCase()===normalized)}
function validateNewPromptName(p,d){if(!p.isNew)return true;const name=String(d.name||'').trim();if(!name){toast('请先填写提示词名称');$('pm-name')?.focus();return false}if(promptNameConflict(p,name)){toast('提示词名称已存在，请换一个名称');$('pm-name')?.focus();return false}return true}
function createPromptTestVersion(id){
 const p=findPrompt(id);if(!p)return;if(!isPromptCreator(p)){duplicatePrompt(id);return}
 const next=Math.max(...promptVersions(p).map(x=>x.v||0))+1,q={...p,id:'prompt-'+Date.now(),family:promptFamily(p),v:next,st:'test',by:promptCurrentName(),at:'刚刚',body:p.body,note:'',runs:0,ed:0,testRuns:0,hist:(p.hist||[]).map(x=>({...x})),slots:(p.slots||[]).slice(),use:p.use?(p.use||[]).slice():undefined};
 (p.shared?PSHARED:PROMPTS).unshift(q);if(q.ag){S.pmPromptFilter=S.pmPromptFilter||{};S.pmPromptFilter[q.ag]='test'}else S.pmSharedFilter='test';pmInheritPromptConversations(p,q);openPrompt(q.id);toast('已创建 v'+next+' 测试版本 · 当前使用中版本保持不变')
}
function duplicatePrompt(id){
 const p=findPrompt(id);if(!p)return;const stamp=Date.now(),shared=!!p.shared,next=Math.max(...promptVersions(p).map(x=>x.v||0))+1,q={...p,id:'prompt-'+stamp,family:promptFamily(p),v:next,st:'test',by:promptCurrentName(),at:'刚刚',note:'',runs:0,ed:0,testRuns:0,hist:(p.hist||[]).map(x=>({...x})),slots:(p.slots||[]).slice(),use:p.use?(p.use||[]).slice():undefined,originId:p.id};
 (shared?PSHARED:PROMPTS).unshift(q);if(shared)S.pmSharedFilter='test';else{S.pmPromptFilter=S.pmPromptFilter||{};S.pmPromptFilter[p.ag]='test'}pmInheritPromptConversations(p,q);openPrompt(q.id);toast('已复制为 v'+next+' 测试版本 · 原版本保持不变')
}
function pmTogglePromptBlock(index){if(!S.pm)return;S.pm.blockOpen=S.pm.blockOpen===index?null:index;S.pm.slotsOpen=false;const shell=document.querySelector('.pm-prompt-blocks'),p=findPrompt(S.pm.id);if(!shell||!p){drawPrompt();return}const scroller=shell.closest('.pm-b'),scrollTop=scroller?.scrollTop||0; shell.innerHTML=pmPromptBlocksHtml(p,S.pm,slotPalette(p));const editable=p.st==='test'&&isPromptCreator(p)&&S.pm.tab===0;shell.querySelectorAll('textarea,select').forEach(control=>control.disabled=!editable);if(!editable)shell.querySelectorAll('.pm-slot').forEach(slot=>slot.removeAttribute('onclick'));if(scroller)scroller.scrollTop=scrollTop}
function pmChangeBlockModel(value){const model=value==='none'?null:value;pmSet('model',model);document.querySelectorAll('.pm-prompt-block-model-select').forEach(select=>select.value=model||'none')}
function pmPromptSectionTabsHtml(d){return `<div class="pm-section-tabs" role="tablist" aria-label="提示词一级板块">${PM_PROMPT_SECTIONS.map(section=>{const active=(d.sectionTab||'shared')===section.id,count=((d.sectionBlocks||PM_PROMPT_SECTION_BLOCKS)[section.id]||[]).length;return `<button type="button" role="tab" aria-selected="${active}" class="${active?'on':''}" onclick="pmSetPromptSection('${section.id}')"><span>${section.name}</span>${count?`<span class="pm-section-count">${count}</span>`:''}</button>`}).join('')}</div>`}
function pmReasonDisclosureHtml(d){const filled=!!String(d.note||'').trim(),summary=String(d.note||'').trim().replace(/\s+/g,' ').slice(0,34);return `<div class="pm-reason-disclosure"><button type="button" class="pm-slot-toggle pm-reason-toggle ${d.reasonOpen?'open':''}" id="pm-reason-toggle" aria-expanded="${d.reasonOpen?'true':'false'}" aria-controls="pm-reason-panel" onclick="pmToggleReason()"><span class="pm-slot-chevron" aria-hidden="true">›</span><b>改动备注</b><span class="pm-reason-state ${filled?'filled':''}" id="pm-reason-state">· ${filled?'已填写':'提交上线必填'}</span><span class="pm-reason-summary" id="pm-reason-summary">${filled?'· '+esc(summary)+(String(d.note).trim().length>34?'…':''):''}</span></button><div class="pm-reason-panel" id="pm-reason-panel" ${d.reasonOpen?'':'hidden'}><textarea id="pm-reason" rows="2" placeholder="改了什么、为什么" oninput="pmSet('note',this.value);pmSyncReasonStatus()">${esc(d.note||'')}</textarea></div></div>`}
function pmToggleReason(force){if(!S.pm)return;S.pm.reasonOpen=typeof force==='boolean'?force:!S.pm.reasonOpen;const toggle=$('pm-reason-toggle'),panel=$('pm-reason-panel');if(toggle){toggle.classList.toggle('open',S.pm.reasonOpen);toggle.setAttribute('aria-expanded',String(S.pm.reasonOpen))}if(panel)panel.hidden=!S.pm.reasonOpen}
function pmOpenReason(){pmToggleReason(true);requestAnimationFrame(()=>$('pm-reason')?.focus())}
function pmSyncReasonStatus(){const value=String(S.pm?.note||'').trim(),state=$('pm-reason-state'),summary=$('pm-reason-summary');if(state){state.textContent='· '+(value?'已填写':'提交上线必填');state.classList.toggle('filled',!!value)}if(summary)summary.textContent=value?'· '+value.replace(/\s+/g,' ').slice(0,34)+(value.length>34?'…':''):''}
function pmSetPromptSection(id){if(!S.pm||!PM_PROMPT_SECTIONS.some(section=>section.id===id))return;S.pm.sectionTab=id;S.pm.optTarget='stage';S.pm.blockOpen=pmSectionBlockIndexes(S.pm)[0]??null;S.pm.slotsOpen=false;const nav=document.querySelector('.pm-section-tabs'),shell=document.querySelector('.pm-prompt-blocks'),p=findPrompt(S.pm.id);if(nav)nav.outerHTML=pmPromptSectionTabsHtml(S.pm);const freshNav=document.querySelector('.pm-section-tabs');if(freshNav)freshNav.scrollLeft=nav?.scrollLeft||0;if(!shell||!p)return;shell.innerHTML=pmPromptBlocksHtml(p,S.pm,slotPalette(p));const editable=p.st==='test'&&isPromptCreator(p)&&S.pm.tab===0;shell.querySelectorAll('textarea,select').forEach(control=>control.disabled=!editable);if(!editable)shell.querySelectorAll('.pm-slot').forEach(slot=>slot.removeAttribute('onclick'));S.pm.activeBlockIndex=pmSectionBlockIndexes(S.pm)[0];requestAnimationFrame(pmResizeBodies);pmRenderOptimize()}
function pmPromptBlocksHtml(p,d,palette){
 const blocks=d.blocks||promptBodyBlocks(d.body),indexes=pmSectionBlockIndexes(d),section=PM_PROMPT_SECTIONS.find(s=>s.id===(d.sectionTab||'shared'));
 if(!indexes.length)return `<div class="pm-section-empty"><span>${esc(section.name)}</span>暂未配置提示词</div>`;
 const used=slotsUsed(indexes.map(i=>blocks[i]||'').join('\n\n'));
 return `<div class="pm-unified-editor"><div class="pm-unified-toolbar"><strong>${esc(section.name)}</strong><select class="pm-prompt-block-model-select" aria-label="提示词组模型" onchange="pmChangeBlockModel(this.value)"><option value="none" ${!d.model?'selected':''}>无直接模型（共享片段）</option>${MODELS.map(m=>`<option ${d.model===m?'selected':''}>${esc(m)}</option>`).join('')}</select><span class="pm-prompt-block-tools"><button type="button" class="ib" title="下载当前阶段提示词" aria-label="下载当前阶段提示词" onclick="downloadPromptBody('stage')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M5 16v4h14v-4"/></svg></button><button type="button" class="ib" title="复制当前阶段提示词" aria-label="复制当前阶段提示词" onclick="copyPromptBody('stage')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 4H5a2 2 0 0 0-2 2v10"/></svg></button></span></div><div class="pm-unified-scroll">${indexes.map((i,n)=>{const meta=pmSectionBlockMeta(d,blocks[i],i,blocks.length);return `<section class="pm-unified-section"><h4>${esc(meta.name)}<span>${esc(meta.group)}</span></h4><textarea class="pm-body pm-unified-body" id="${n===0?'pm-body':'pm-body-'+i}" data-block-index="${i}" aria-label="${esc(meta.name)}正文" onfocus="S.pm.activeBlockIndex=${i}" oninput="pmSyncSlots(this)">${esc(blocks[i]||'')}</textarea></section>`}).join('')}</div></div><div class="pm-slot-disclosure"><button type="button" class="pm-slot-toggle ${d.slotsOpen?'open':''}" id="pm-slot-toggle" aria-expanded="${!!d.slotsOpen}" aria-controls="pm-slot-panel" onclick="pmToggleSlots()"><span class="pm-slot-chevron" aria-hidden="true">›</span><b>变量槽</b><span class="pm-slot-count">${palette.length} · 已用 <span id="pm-slot-used">${used.length}</span></span><span class="pm-slot-hint">· 由代码填充，点击插入光标处</span></button><div class="pm-slot-panel" id="pm-slot-panel" ${d.slotsOpen?'':'hidden'}><div class="pm-slots" id="pm-slotbox">${palette.map(s=>`<span class="pm-slot ${used.includes(s)?'used':''}" onclick="pmInsertSlot('${s}')">${esc(s)}</span>`).join('')}</div></div></div>`
}
function pmResizeBodies(){document.querySelectorAll('.pm-unified-body').forEach(t=>{t.style.height='0px';t.style.height=Math.max(64,t.scrollHeight)+'px'});const shell=document.querySelector('.pm-unified-scroll');if(shell&&pmResizeBodies.shell!==shell&&typeof ResizeObserver!=='undefined'){pmResizeBodies.observer?.disconnect();pmResizeBodies.shell=shell;let width=shell.clientWidth;pmResizeBodies.observer=new ResizeObserver(()=>{if(shell.clientWidth!==width){width=shell.clientWidth;pmResizeBodies()}});pmResizeBodies.observer.observe(shell)}}
function pmInsertSlot(slot){const t=document.querySelector('textarea[data-block-index="'+S.pm.activeBlockIndex+'"]')||$('pm-body');if(!t||t.disabled)return;const a=t.selectionStart||0,b=t.selectionEnd||0;t.value=t.value.slice(0,a)+slot+t.value.slice(b);t.focus();t.selectionStart=t.selectionEnd=a+slot.length;pmSyncSlots(t)}
function pmToggleSlots(){if(!S.pm)return;S.pm.slotsOpen=!S.pm.slotsOpen;const toggle=$('pm-slot-toggle'),panel=$('pm-slot-panel');if(toggle){toggle.classList.toggle('open',S.pm.slotsOpen);toggle.setAttribute('aria-expanded',String(S.pm.slotsOpen))}if(panel)panel.hidden=!S.pm.slotsOpen}
function pmSyncSlots(field){const p=findPrompt(S.pm.id),t=field||$('pm-body');if(!p||!t)return;const index=Number(t.dataset.blockIndex||0),blocks=S.pm.blocks||promptBodyBlocks(S.pm.body);blocks[index]=t.value;S.pm.blocks=blocks;const body=blocks.join('\n\n');pmSet('body',body);pmResizeBodies();const blockUsed=slotsUsed(pmSectionBlockIndexes(S.pm).map(i=>blocks[i]||'').join('\n\n')),bad=badSlots(p,body),box=$('pm-slotbox'),warn=$('pm-slotwarn'),submit=$('pm-submit'),usedCount=$('pm-slot-used');if(box)box.innerHTML=slotPalette(p).map(s=>`<span class="pm-slot ${blockUsed.includes(s)?'used':''}" onclick="pmInsertSlot('${s}')">${esc(s)}</span>`).join('');if(usedCount)usedCount.textContent=blockUsed.length;if(warn)warn.innerHTML=bad.length?`<div class="pm-bad">正文里有 ${bad.length} 个没声明的变量槽：${bad.map(esc).join(' ')}。请删除或让开发补充槽位。</div>`:'';if(submit)submit.disabled=!!bad.length}
function drawPrompt(){const d=S.pm,p=findPrompt(d.id);if(!p)return;const st=PMST[p.st],used=slotsUsed(d.body),bad=badSlots(p,d.body),palette=slotPalette(p),tabs=['编辑','版本历史'];$('mod').innerHTML=`<div class="mbox pm-editor"><div class="pm-l"><div class="pm-h"><div style="flex:1;min-width:0"><div class="ey">${p.shared?'共享提示词':promptAgentName(p)}</div>${p.isNew?`<div class="pm-new-title"><input id="pm-name" maxlength="40" value="${esc(d.name)}" placeholder="输入提示词名称" aria-label="提示词名称" oninput="pmSet('name',this.value)"><strong>· v${p.v}</strong></div>`:`<h3>${esc(p.n)} · v${p.v}</h3>`}</div><span class="st ${st.c}">${st.n}</span><button class="ib" onclick="closeMod()" title="关闭">×</button></div><div class="dw-tabs">${tabs.map((t,i)=>`<button class="${d.tab===i?'on':''}" onclick="S.pm.tab=${i};drawPrompt()">${t}</button>`).join('')}</div><div class="pm-b">${d.tab===1?pmHistory(p):`${p.st==='live'?`<div class="note" style="margin-bottom:var(--sp-3)">这一版正在生效。修改后会保存成 <b>v${p.v+1} 草稿</b>，当前版本保留不动。</div>`:''}<div class="fld"><label>提示词正文</label><textarea class="pm-body" id="pm-body" oninput="pmSyncSlots()">${esc(d.body)}</textarea></div><div class="pm-slot-disclosure"><button type="button" class="pm-slot-toggle ${d.slotsOpen?'open':''}" id="pm-slot-toggle" aria-expanded="${d.slotsOpen?'true':'false'}" aria-controls="pm-slot-panel" onclick="pmToggleSlots()"><span class="pm-slot-chevron" aria-hidden="true">›</span><b>变量槽</b><span class="pm-slot-count"><span>${palette.length}</span> · 已用 <span id="pm-slot-used">${used.length}</span></span><span class="pm-slot-hint">· 由代码填充，点击插入光标处</span></button><div class="pm-slot-panel" id="pm-slot-panel" ${d.slotsOpen?'':'hidden'}><div class="pm-slots" id="pm-slotbox">${palette.map(s=>`<span class="pm-slot ${used.includes(s)?'used':''}" onclick="pmInsertSlot('${s}')">${esc(s)}</span>`).join('')}</div></div></div><div id="pm-slotwarn">${bad.length?`<div class="pm-bad">正文里有未声明的变量槽：${bad.map(esc).join(' ')}</div>`:''}</div><div class="pm-two" style="margin-top:var(--sp-4)"><div class="fld" style="margin:0"><label>模型</label><select onchange="pmSet('model',this.value==='none'?null:this.value)"><option value="none" ${!d.model?'selected':''}>无直接模型（共享片段）</option>${MODELS.map(m=>`<option ${d.model===m?'selected':''}>${m}</option>`).join('')}</select></div><div class="fld" style="margin:0"><label>类型</label><select disabled><option>${PMTYPE[p.ty]}</option></select></div></div><div class="fld" style="margin-top:var(--sp-3)"><label>改动理由 <span class="ct">提交上线必填</span></label><textarea rows="2" placeholder="改了什么、为什么" oninput="pmSet('note',this.value)">${esc(d.note)}</textarea></div>`}</div><div class="pm-f">${d.tab===1?`<button class="btn ghost" onclick="S.pm.tab=0;drawPrompt()">回到编辑</button>`:`<button class="btn ghost" onclick="savePromptDraft()">存草稿</button><button class="btn ghost" onclick="promptToTest()">进入测试</button><button class="btn" id="pm-submit" onclick="submitPrompt()" ${bad.length?'disabled':''}>提交上线</button><span style="margin-left:auto;font-size:var(--fs-xs);color:var(--t3)">批准人 ${promptOwner(p)}</span>`}</div></div><div class="pm-r"><div class="pm-h" style="background:var(--surface-tint)"><div><div class="ey">试跑</div><h3 style="font-size:var(--fs-md)">用这一版跑一句看看</h3></div></div><div class="pm-b"><div style="font-size:var(--fs-xs);color:var(--t3);line-height:1.6;margin-bottom:var(--sp-3)">试跑使用沙箱数据，不会写进线程，也不会产生产出物。</div><div class="pm-chat" id="pm-chat">${d.chat.length?d.chat.map(m=>`<div class="pm-msg ${m.r}">${m.r==='ag'?`<span class="pmw">${esc(p.n||d.name||'新建提示词')} · v${p.v}</span>`:''}${esc(m.t)}</div>`).join(''):'<div class="csa-empty" style="padding:var(--sp-5) 16px">还没跑过。下面写一句试试。</div>'}</div></div><div class="pm-f" style="flex-direction:column;align-items:stretch"><textarea id="pm-in" rows="2" placeholder="写一句输入试试…"></textarea><div style="display:flex;align-items:center;gap:8px"><span style="flex:1;font-size:var(--fs-xs);color:var(--t3)">沙箱 · 不产生产出物</span><button class="btn ghost sm" onclick="pmResetChat()">重置对话</button><button class="btn sm" onclick="pmRun()">跑一次</button></div></div></div></div>`}
const _drawPromptLayout=drawPrompt;
drawPrompt=function(){_drawPromptLayout();mountPromptChrome()};
function mountPromptChrome(){
 const editor=document.querySelector('.pm-editor'),rightHead=editor&&editor.querySelector('.pm-r>.pm-h');if(!editor||!rightHead)return;
 editor.classList.toggle('wide',!!S.pmWide);
 $('mod').classList.toggle('pm-wide-mode',!!S.pmWide);
 const initialBody=$('pm-body'),initialField=initialBody&&initialBody.closest('.fld'),initialSlots=editor.querySelector('.pm-l .pm-slot-disclosure');
 if(initialField&&S.pm?.tab===0){const p=findPrompt(S.pm.id),nav=document.createElement('div'),shell=document.createElement('div');nav.innerHTML=pmPromptSectionTabsHtml(S.pm);shell.className='pm-prompt-blocks';shell.innerHTML=pmPromptBlocksHtml(p,S.pm,slotPalette(p));initialField.before(nav.firstElementChild,shell);initialField.remove();if(initialSlots)initialSlots.remove()}
 const formRow=editor.querySelector('.pm-l .pm-two');
 if(formRow){
  const next=formRow.nextElementSibling,reason=next&&next.classList.contains('fld')?next:null;
  formRow.remove();
  if(reason){const disclosure=document.createElement('div');disclosure.innerHTML=pmReasonDisclosureHtml(S.pm);reason.replaceWith(disclosure.firstElementChild)}
 }
 applyPromptState(editor);requestAnimationFrame(pmResizeBodies);
 mountPromptRunControls(editor);
 let wide=$('pm-wide');
 if(!wide){wide=document.createElement('button');wide.id='pm-wide';wide.className='ib';wide.setAttribute('onclick','pmToggleWide()');rightHead.appendChild(wide)}
 wide.title=S.pmWide?'收缩':'加宽';wide.setAttribute('aria-label',wide.title);
 wide.innerHTML=S.pmWide?'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5"/></svg>':'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>';
 const close=editor.querySelector('.pm-l>.pm-h>.ib');if(close)rightHead.appendChild(close);
 mountPromptTools(editor);
}
function mountPromptTools(editor){
 const d=S.pm,right=editor.querySelector('.pm-r');if(!d||!right)return;
 pmInitSessions();
 editor.classList.add('pm-has-tools');
 let rail=editor.querySelector('.pm-tool-rail');
 if(!rail){rail=document.createElement('nav');rail.className='pm-tool-rail';rail.setAttribute('aria-label','提示词辅助工具');rail.innerHTML=`<button type="button" data-tool="run" onclick="pmSwitchTool('run')" title="测试" aria-label="测试"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 11 7-11 7Z"/></svg><span>测试</span></button><button type="button" data-tool="optimize" onclick="pmSwitchTool('optimize')" title="AI 优化" aria-label="AI 优化"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/></svg><span>优化</span></button>`;right.before(rail)}
 const input=right.querySelector('#pm-in');if(input){input.value=d.runInput||'';input.oninput=()=>{d.runInput=input.value;pmRememberSession('run')}}
 let panel=right.querySelector('.pm-opt-panel');if(!panel){panel=document.createElement('div');panel.className='pm-opt-panel';right.appendChild(panel)}
 pmRenderOptimize();pmSwitchTool(d.toolMode||'run');
}
const PM_CONVERSATIONS=new Map();
let pmConversationSequence=0;
function pmSessionBook(){
 if(!S.pm)return null;
 const key=currentUser()+'|'+S.pm.id;
 if(!PM_CONVERSATIONS.has(key))PM_CONVERSATIONS.set(key,{run:[],optimize:[],active:{}});
 return PM_CONVERSATIONS.get(key);
}
function pmFreshSession(){return {id:++pmConversationSequence,at:Date.now(),title:'新会话',data:{}}}
function pmRestoreConversationView(){
 const d=S.pm;if(!d)return;
 const view=PM_CONVERSATIONS.get(currentUser()+'|'+d.id)?.view;
 if(view){d.toolMode=view.toolMode;d.sectionTab=view.sectionTab}
}
function pmInheritPromptConversations(source,target){
 const d=S.pm,user=currentUser();
 if(d?.id===source.id){
  pmRememberSession('run');pmRememberSession('optimize');
  const book=pmSessionBook();book.view={toolMode:d.toolMode||'run',sectionTab:d.sectionTab||'shared'};
 }
 const original=PM_CONVERSATIONS.get(user+'|'+source.id);if(!original)return;
 const copy={run:[],optimize:[],active:{},view:original.view?{...original.view}:undefined};
 ['run','optimize'].forEach(mode=>{
  copy[mode]=original[mode].map(session=>{
   const cloned=JSON.parse(JSON.stringify(session));cloned.id=++pmConversationSequence;
   if(session.id===original.active[mode])copy.active[mode]=cloned.id;
   return cloned;
  });
 });
 PM_CONVERSATIONS.set(user+'|'+target.id,copy);
 if(target.blocks)target.blocks=target.blocks.slice();
}
function pmInitSessions(){
 const d=S.pm;if(!d||d.sessionsLoaded)return;
 const book=pmSessionBook();d.sessionsLoaded=true;
 ['run','optimize'].forEach(mode=>{
  let session=book[mode].find(item=>item.id===book.active[mode]);
  if(!session){session=pmFreshSession();book[mode].push(session);book.active[mode]=session.id}
  pmRestoreSessionData(mode,session.data);
 });
}
function pmRestoreSessionData(mode,data){
 const d=S.pm;if(!d)return;const copy=JSON.parse(JSON.stringify(data||{}));
 if(mode==='run'){d.chat=copy.chat||[];d.runInput=copy.input||'';d.runMode=copy.runMode||'full'}
 else{d.optChat=copy.chat||[];d.optInput=copy.input||'';d.optReply=copy.reply||'';d.optProposal=copy.proposal||null;d.optTarget=copy.target||'stage'}
}
function pmRememberSession(mode){
 const d=S.pm;if(!d?.sessionsLoaded)return;
 const book=pmSessionBook(),session=book[mode].find(item=>item.id===book.active[mode]);if(!session)return;
 const data=mode==='run'?{chat:d.chat||[],input:d.runInput||'',runMode:d.runMode}:{chat:d.optChat||[],input:d.optInput||'',reply:d.optReply,proposal:d.optProposal,target:d.optTarget};
 session.data=JSON.parse(JSON.stringify(data));session.title=(data.chat.find(m=>m.r==='me')?.t||data.input||'新会话').replace(/\s+/g,' ').slice(0,36);
 session.at=Date.now();
}
function pmMountSessionToolbar(){
 const right=document.querySelector('.pm-editor .pm-r');if(!right||!S.pm)return;
 let toolbar=right.querySelector('.pm-session-toolbar');
 if(!toolbar){toolbar=document.createElement('div');toolbar.className='pm-session-toolbar';right.querySelector('.pm-h').after(toolbar)}
 const mode=S.pm.toolMode||'run';
 toolbar.innerHTML=`<button type="button" class="btn ghost sm" id="pm-session-history-button" aria-expanded="false" aria-controls="pm-session-history" onclick="pmToggleSessionHistory()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5m4 0v5l3 2"/></svg>历史记录</button><button type="button" class="btn ghost sm" onclick="pmNewSession()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>新会话</button>`;
 let history=right.querySelector('.pm-session-history');
 if(!history){history=document.createElement('section');history.id='pm-session-history';history.className='pm-session-history';history.hidden=true;history.setAttribute('aria-label','会话历史');right.appendChild(history);history.addEventListener('keydown',event=>{if(event.key==='Escape'){event.stopPropagation();pmToggleSessionHistory(false);$('pm-session-history-button')?.focus()}})}
 history.hidden=true;
}
function pmToggleSessionHistory(force){
 const history=$('pm-session-history'),d=S.pm;if(!history||!d)return;
 const open=typeof force==='boolean'?force:history.hidden;
 if(open){
  const mode=d.toolMode||'run';pmRememberSession(mode);const book=pmSessionBook();
  const sessions=book[mode].filter(item=>item.data.chat?.length||item.data.input||item.data.reply).slice().sort((a,b)=>b.at-a.at);
  history.innerHTML=`<div class="pm-session-history-head"><strong>历史记录</strong><button type="button" class="ib" onclick="pmToggleSessionHistory(false)" aria-label="关闭历史记录">×</button></div>${sessions.length?sessions.map(item=>`<button type="button" class="pm-session-entry ${book.active[mode]===item.id?'on':''}" onclick="pmOpenSession(${item.id})"><span>${esc(item.title)}</span><small>${esc(new Date(item.at).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}))}${book.active[mode]===item.id?' · 当前会话':''}</small></button>`).join(''):'<p class="pm-session-empty">暂无历史记录，发送一条消息后会自动保留。</p>'}`;
 }
 history.hidden=!open;$('pm-session-history-button')?.setAttribute('aria-expanded',String(open));
}
function pmRenderSessionBody(mode){
 const d=S.pm;if(!d)return;
 pmToggleSessionHistory(false);
 if(mode==='optimize')pmRenderOptimize();
 else{
  const p=findPrompt(d.id),chat=$('pm-chat'),input=$('pm-in');
  if(chat)chat.innerHTML=d.chat.length?pmChatHtml(p,d.chat):'<div class="csa-empty" style="padding:var(--sp-5) 16px">还没跑过。下面写一句试试。</div>';
  if(input)input.value=d.runInput||'';
  pmSetRunMode(d.runMode==='step'?'step':'full');
 }
 requestAnimationFrame(()=>(mode==='run'?$('pm-in'):$('pm-opt-input'))?.focus());
}
function pmNewSession(){
 const d=S.pm;if(!d)return;const mode=d.toolMode||'run';pmRememberSession(mode);
 const book=pmSessionBook(),session=pmFreshSession();book[mode].push(session);book.active[mode]=session.id;
 pmRestoreSessionData(mode,{});pmRenderSessionBody(mode);
}
function pmOpenSession(id){
 const d=S.pm;if(!d)return;const mode=d.toolMode||'run',book=pmSessionBook(),session=book[mode].find(item=>item.id===id);if(!session)return;
 pmRememberSession(mode);book.active[mode]=id;pmRestoreSessionData(mode,session.data);pmRenderSessionBody(mode);toast('已恢复会话，左侧提示词保持不变');
}
function pmSwitchTool(mode){
 const d=S.pm,right=document.querySelector('.pm-editor .pm-r');if(!d||!right||!['run','optimize'].includes(mode))return;
 d.toolMode=mode;right.classList.toggle('pm-opt-mode',mode==='optimize');
 document.querySelectorAll('.pm-tool-rail button').forEach(b=>{const on=b.dataset.tool===mode;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))});
 const heading=right.querySelector('.pm-h h3'),label=right.querySelector('.pm-h .ey');
 if(heading){if(!heading.dataset.runTitle)heading.dataset.runTitle=heading.textContent;heading.textContent=mode==='optimize'?'一起调整提示词':heading.dataset.runTitle}
 if(label)label.textContent=mode==='optimize'?'AI 优化 · 演示':'试跑';
 pmMountSessionToolbar();
}
function pmOptimizeTargets(){return pmSectionBlockIndexes(S.pm).filter(i=>typeof S.pm.blocks[i]==='string')}
function pmRenderOptimize(){
 const d=S.pm,p=findPrompt(d?.id),panel=document.querySelector('.pm-opt-panel');if(!d||!p||!panel)return;
 const targets=pmOptimizeTargets(),editable=p.st==='test'&&isPromptCreator(p),proposal=d.optProposal;
 panel.innerHTML=`<div class="pm-opt-content"><div class="pm-opt-messages">${(d.optChat||[]).filter(m=>m.r==='me').map(m=>`<div class="pm-msg me">${esc(m.t)}</div>`).join('')||'<div class="pm-opt-empty"><strong>想怎么调整？</strong><p>例如：语气自然一点，减少重复，但保留变量和输出格式。</p></div>'}</div>${d.optReply?`<div class="pm-opt-response">${esc(d.optReply)}</div>`:''}${proposal?`<div class="pm-opt-apply">${proposal.applied?`<span class="pm-opt-applied"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>已应用</span><button type="button" class="btn ghost sm" onclick="pmGoOptimizeTest()">去测试</button>`:`<button type="button" class="btn sm" onclick="pmApplyOptimize()" ${editable?'':'disabled'}>应用到编辑区</button>`}${!editable?'<p class="pm-opt-notice">当前版本只读，请先在左侧创建测试版本或副本。</p>':''}</div>`:''}</div><div class="pm-opt-composer"><textarea id="pm-opt-input" aria-label="修改要求" rows="3" placeholder="例如：正文少一点广告感，保留原有字段和变量" oninput="S.pm.optInput=this.value;pmRememberSession('optimize')">${esc(d.optInput||'')}</textarea><div class="pm-opt-bottom"><div class="pm-opt-scope"><label for="pm-opt-scope">修改范围</label><select id="pm-opt-scope" onchange="S.pm.optTarget=this.value"><option value="stage">${esc(PM_PROMPT_SECTIONS.find(section=>section.id===(d.sectionTab||'shared'))?.name||'当前阶段')}（全部）</option>${targets.map(i=>`<option value="${i}" ${String(d.optTarget)===String(i)?'selected':''}>${esc(pmSectionBlockMeta(d,d.blocks[i],i,d.blocks.length).name)}</option>`).join('')}</select></div><button type="button" class="btn sm" onclick="pmGenerateOptimize()" ${targets.length?'':'disabled'}>发送</button></div></div>`;
 const select=$('pm-opt-scope');if(select&&[...select.options].some(o=>o.value===d.optTarget))select.value=d.optTarget;
 pmRememberSession('optimize');
}
function pmGenerateOptimize(){
 const d=S.pm,request=String(d?.optInput||'').trim();if(!request){toast('先写一下想怎么调整');return}
 const targets=pmOptimizeTargets(),indexes=d.optTarget&&d.optTarget!=='stage'?targets.filter(i=>String(i)===d.optTarget):targets;
 if(!indexes.length){toast('当前阶段没有可修改的提示词');return}
 d.optChat=d.optChat||[];d.optChat.push({r:'me',t:request});
 if(/^\d+$/.test(request)){d.optProposal=null;d.optReply='你想调整哪一方面呢？可以直接说，比如：语气自然一点、正文精简一些，或者减少重复。我会围绕你的要求来调整，不再逐个重复原文。';d.optInput='';pmRenderOptimize();return}
 d.optProposal={items:indexes.map(i=>({index:i,name:pmSectionBlockMeta(d,d.blocks[i],i,d.blocks.length).name,before:d.blocks[i],after:d.blocks[i]+(i===indexes[0]?'\n\n本次调整要求：'+request:'')})),applied:false};
 d.optReply='收到，你希望「'+request+'」。我会保留现有变量和输出格式，把这次要求补充到当前范围的主说明中，其他段落先不改，也不再把整套提示词重复贴出来。\n\n你可以点下方按钮回填，然后切到试跑看看效果。当前仍是交互演示，尚未调用 AI，实际草案只是补充了你的调整要求。';d.optInput='';d.optCompare=false;pmRenderOptimize();
}
function pmApplyOptimize(){
 const d=S.pm,p=findPrompt(d?.id),proposal=d?.optProposal;if(!p||!proposal||proposal.applied)return;
 if(p.st!=='test'||!isPromptCreator(p)){toast('请先创建可编辑的测试版本');return}
 if(proposal.items.some(item=>d.blocks[item.index]!==item.before)){toast('原文已变化，请重新生成草案，避免覆盖新修改');return}
 if(proposal.items.some(item=>!item.after.trim()||slotsUsed(item.before).some(slot=>!slotsUsed(item.after).includes(slot)))){toast('草案不能为空，且需要保留原有变量槽');return}
 const blocks=d.blocks.slice();proposal.items.forEach(item=>blocks[item.index]=item.after);
 if(badSlots(p,blocks.join('\n\n')).length){toast('草案包含未声明的变量槽，请先修正');return}
 d.blocks=blocks;pmSet('body',blocks.join('\n\n'));proposal.applied=true;
 drawPrompt();toast('已应用到编辑区，尚未保存，可切换到试跑');
}
function pmGoOptimizeTest(){
 const d=S.pm,p=findPrompt(d?.id);if(!d||!p)return;
 if(!['test','live','pending','retired'].includes(p.st)){toast('当前版本不能试跑');return}
 pmSwitchTool('run');
 const hint=document.querySelector('.pm-r>.pm-b>div:first-child');
 if(hint)hint.textContent='测试当前编辑稿（包含未保存修改）。原型演示，不会保存、上线或产生产出物。';
 const input=$('pm-in');if(input&&!input.disabled)input.focus();
}
function mountPromptRunControls(editor){
 const input=editor.querySelector('#pm-in'),row=input&&input.nextElementSibling;if(!row)return;
 const p=findPrompt(S.pm&&S.pm.id),canRun=!!(p&&['test','live','pending','retired'].includes(p.st)),mode=S.pm?.runMode==='step'?'step':'full';
 row.className='pm-run-toolbar';
 row.innerHTML=`<span class="pm-sandbox-note">沙箱 · 不产生产出物</span><div class="pm-run-actions"><div class="pm-run-mode" role="group" aria-label="运行方式"><button type="button" data-mode="step" class="${mode==='step'?'on':''}" aria-pressed="${mode==='step'}" onclick="pmSetRunMode('step')">单步调整</button><button type="button" data-mode="full" class="${mode==='full'?'on':''}" aria-pressed="${mode==='full'}" onclick="pmSetRunMode('full')">跑全程</button></div><button class="btn sm pm-send" onclick="pmRun()" ${canRun?'':'disabled'}>发送</button></div>`;
}
function applyPromptState(editor){
 const p=findPrompt(S.pm.id),d=S.pm;if(!p)return;const creator=isPromptCreator(p),reviewer=isPromptReviewer(),editable=p.st==='test'&&creator&&d.tab===0,canRun=['test','live','pending','retired'].includes(p.st),pending=otherPendingPromptVersion(p),body=editor.querySelector('.pm-l>.pm-b'),footer=editor.querySelector('.pm-l>.pm-f');
 editor.classList.toggle('pm-readonly',!editable);
 let dirty=$('pm-dirty');if(!editable){if(dirty)dirty.remove()}else{if(!dirty){dirty=document.createElement('span');dirty.id='pm-dirty';dirty.className='chip pm-dirty';dirty.textContent='未保存';const status=editor.querySelector('.pm-l>.pm-h .st');if(status)status.before(dirty)}pmDirtyState()}
 if(d.tab===1)return;
 if(body){body.querySelectorAll('textarea,select').forEach(el=>el.disabled=!editable);if(!editable)body.querySelectorAll('.pm-slot').forEach(el=>el.removeAttribute('onclick'));
  let note=body.querySelector(':scope>.note');const copy=!creator?(p.st==='pending'&&reviewer?`该版本由 ${p.by} 提交，等待你审核。内容只读，可批准或退回。`:`该提示词由 ${p.by} 创建。当前身份只能查看和试跑，如需修改请创建独立副本。`):p.st==='live'?'使用中的提示词不可编辑，可在右侧进行测试。如需修改，请先创建测试版本。':p.st==='pending'?'该版本已提交上线，审批期间内容已锁定。撤回后可继续修改。':p.st==='retired'?'该版本已经下线，仅供查看。需要再次使用时，请创建测试版本。':pending?`同组 v${pending.v} 正在等待上线审核。审核完成、退回或撤回前，其他版本不能提交或回滚。`:'';
  if(copy){if(!note){note=document.createElement('div');note.className='note';note.style.marginBottom='var(--sp-3)';body.prepend(note)}note.textContent=copy}else if(note)note.remove();
 }
 if(footer){const owner=promptOwner(),bad=badSlots(p,d.body);footer.innerHTML=!creator?(p.st==='pending'&&reviewer?`<button class="btn" onclick="approvePrompt('${p.id}')">批准上线</button><button class="btn ghost" onclick="returnPromptForChanges('${p.id}')">退回修改</button><button class="btn ghost" onclick="toast('改动对比功能正在开发中')">改动对比</button><span class="pm-foot-note">你是提示词审核负责人</span>`:`<button class="btn" onclick="duplicatePrompt('${p.id}')">创建测试副本</button><span class="pm-foot-note">由 ${p.by} 创建 · 当前身份仅可试跑</span>`):p.st==='live'?`<button class="btn" onclick="createPromptTestVersion('${p.id}')">创建测试版本</button><span class="pm-foot-note">当前版本继续生效</span>`:p.st==='test'?`<button class="btn" onclick="savePromptDraft()">保存修改</button><button class="btn ghost" id="pm-submit" onclick="submitPrompt()" ${bad.length?'disabled':''}>提交上线</button><button class="btn ghost pm-delete" onclick="pmAskDeletePromptTestVersion()">删除版本</button><button class="btn ghost" id="pm-reset" style="margin-left:auto" onclick="resetPromptChanges()" ${d.dirty?'':'disabled'}>清除所有更改</button>`:p.st==='pending'?`<button class="btn ghost" onclick="withdrawPrompt()">撤回修改</button><span class="pm-foot-note">等待 ${owner} 审核</span>`:`<button class="btn" onclick="createPromptTestVersion('${p.id}')">创建测试版本</button><span class="pm-foot-note">当前版本只读</span>`}
 const runTitle=editor.querySelector('.pm-r>.pm-h h3'),runHint=editor.querySelector('.pm-r>.pm-b>div:first-child');
 if(runTitle)runTitle.textContent=p.st==='live'?'试跑当前使用版本':p.st==='pending'?'试跑待上线版本':p.st==='retired'?'试跑已下线版本':'用这一版跑一句看看';
 if(runHint)runHint.textContent=p.st==='live'?'仅用于验证当前线上提示词，不影响线上版本和正式产出。':p.st==='pending'?'仅用于上线前验证，不会修改内容或改变审批状态。':p.st==='retired'?'仅用于回看验证，不会重新上线或改变版本状态。':'试跑使用沙箱数据，不会写进线程，也不会产生产出物。';
 const input=editor.querySelector('#pm-in'),run=editor.querySelector('button[onclick="pmRun()"]');if(input){input.disabled=!canRun;input.placeholder=p.st==='live'?'输入一句话，验证当前使用版本…':p.st==='pending'?'输入一句话，验证待上线版本…':p.st==='retired'?'输入一句话，验证已下线版本…':p.st==='test'?'写一句输入试试…':'当前状态不可试跑'}if(run)run.disabled=!canRun;
}
function pmToggleWide(){S.pmWide=!S.pmWide;mountPromptChrome()}
function promptBodyText(index){if(index==='stage'){const d=S.pm,b=d.blocks||promptBodyBlocks(d.body);return pmSectionBlockIndexes(d).map(i=>pmSectionBlockMeta(d,b[i],i,b.length).name+'\n'+(b[i]||'')).join('\n\n')}if(Number.isInteger(index)){const field=document.querySelector(`#pm-body[data-block-index="${index}"]`);if(field)return field.value;const blocks=S.pm?.blocks||promptBodyBlocks(S.pm?.body||'');return String(blocks[index]||'')}const field=$('pm-body');return field?field.value:String(S.pm?.body||'')}
async function copyPromptBody(index){const text=promptBodyText(index);try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(text);else{const helper=document.createElement('textarea');helper.value=text;helper.style.position='fixed';helper.style.opacity='0';document.body.appendChild(helper);helper.select();document.execCommand('copy');helper.remove()}toast('当前板块已复制')}catch(e){toast('复制失败，请手动复制')}}
function downloadPromptBody(index){const p=findPrompt(S.pm&&S.pm.id);if(!p)return;const blocks=S.pm?.blocks||promptBodyBlocks(S.pm?.body||''),meta=Number.isInteger(index)?pmSectionBlockMeta(S.pm,blocks[index],index,blocks.length):null,blob=new Blob([promptBodyText(index)],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a'),base=(p.n||'提示词')+(meta?'-'+meta.name:''),name=base.replace(/[\\/:*?"<>|]/g,'-');link.href=url;link.download=name+'-v'+p.v+'.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('当前板块已下载')}
const _closePromptModal=closeMod;
closeMod=function(){S.pmWide=false;const modal=$('mod'),draft=S.pm&&findPrompt(S.pm.id);if(modal)modal.classList.remove('pm-wide-mode');if(draft&&draft.isNew){const list=draft.shared?PSHARED:PROMPTS,index=list.findIndex(x=>x.id===draft.id);if(index>=0)list.splice(index,1)}pmRememberSession('run');pmRememberSession('optimize');S.pm=null;_closePromptModal();if(draft&&draft.isNew){render();if(S.ag)drawAgent()}};
function pmChatHtml(p,chat){return chat.map(m=>`<div class="pm-msg ${m.r}">${m.r==='ag'?`<span class="pmw">${esc(p.n)} · v${p.v}</span>`:''}${esc(m.t)}</div>`).join('')}
function pmResetChat(){
 const d=S.pm,chat=$('pm-chat'),input=$('pm-in');if(!d)return;d.chat=[];
 if(chat)chat.innerHTML='<div class="csa-empty" style="padding:var(--sp-5) 16px">还没跑过。下面写一句试试。</div>';
 if(input){input.value='';input.focus()}
}
function pmSetRunMode(mode){
 const d=S.pm;if(!d||!['step','full'].includes(mode))return;d.runMode=mode;
 document.querySelectorAll('.pm-run-mode button').forEach(button=>{const active=button.dataset.mode===mode;button.classList.toggle('on',active);button.setAttribute('aria-pressed',String(active))});
}
function pmRun(){
 const d=S.pm,p=findPrompt(d.id),i=$('pm-in'),text=i&&i.value.trim();if(!text){toast('先写一句输入');return}
 if(!['test','live','pending','retired'].includes(p.st)){toast('当前状态不能试跑');return}
 const full=d.runMode==='full';
 d.chat.push({r:'me',t:text},{r:'ag',t:full?'已按完整链路跑完全程，各步骤衔接与约束检查通过。':p.shared?'片段已注入；下游提示词会继续生成。':'已完成当前步骤的调整测试。变量槽与约束检查通过。'});
 if(p.st==='test')p.testRuns=(p.testRuns||0)+1;
 const chat=$('pm-chat');if(chat){chat.innerHTML=pmChatHtml(p,d.chat);chat.scrollTop=chat.scrollHeight}if(i){i.value='';d.runInput='';i.focus()}pmRememberSession('run');
}
function pmHistory(p){const versions=promptVersions(p),pending=versions.find(version=>version.st==='pending'),byNumber=new Map();versions.forEach(version=>{byNumber.set(version.v,{v:version.v,by:version.by,at:version.at,note:version.note,state:version.st,id:version.id});(version.hist||[]).forEach(h=>{if(!byNumber.has(h.v))byNumber.set(h.v,{...h,state:null,id:p.id})})});const rows=[...byNumber.values()].sort((a,b)=>b.v-a.v);return `<div style="font-size:var(--fs-sm);color:var(--t2);line-height:1.7;margin-bottom:var(--sp-3)">每一版都保留。${pending?`v${pending.v} 正在等待上线审核，审核完成前不能回滚。`:'需要时可以提交回滚到历史版本。'}</div>${rows.map(h=>{const rollback=`<button class="btn ghost sm" onclick="revertPrompt('${p.id}',${h.v})">回到这版</button>`,action=h.state==='live'?'<span class="st done">使用中</span>':h.state==='pending'?'<span class="st review">待上线</span>':h.state==='test'?'<span class="st run">测试中</span>':rollback;return `<div class="pm-ver"><span class="pmv">v${h.v}</span><span class="pl"><span class="pm-ver-note-label">改动理由(备注)：</span>${h.note&&h.note!=='—'?esc(h.note):'<span style="color:var(--danger-fg)">未填写</span>'}</span><span style="font-size:var(--fs-xs);color:var(--t3)">${h.by} · ${h.at}</span>${action}</div>`}).join('')}`}
function pmAskDeletePromptTestVersion(){
 const p=findPrompt(S.pm&&S.pm.id);if(!p||p.st!=='test'){toast('只有测试中的版本可以删除');return}
 pmCloseDeleteDialog();const layer=document.createElement('div');layer.id='pm-delete-dialog';layer.className='pm-confirm-layer';layer.onclick=e=>{if(e.target===layer)pmCloseDeleteDialog()};
 layer.innerHTML=`<section class="pm-confirm-card" role="dialog" aria-modal="true" aria-labelledby="pm-delete-title"><div class="pm-confirm-head"><span class="pm-confirm-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2m-9 0 1 15h8l1-15M10 11v6M14 11v6"/></svg></span><div><div class="ey">删除测试版本</div><h3 id="pm-delete-title">确认删除这个版本？</h3></div><button class="ib" onclick="pmCloseDeleteDialog()" aria-label="关闭">×</button></div><div class="pm-confirm-body"><strong>${esc(p.n)} · v${p.v}</strong><p>删除后无法恢复，但不会影响当前使用中的版本。</p></div><div class="pm-confirm-foot"><button class="btn ghost" onclick="pmCloseDeleteDialog()">取消</button><button class="btn pm-confirm-delete" onclick="deletePromptTestVersion()">删除版本</button></div></section>`;
 layer.addEventListener('keydown',e=>{if(e.key==='Escape')pmCloseDeleteDialog()});$('mod').appendChild(layer);layer.querySelector('.btn.ghost').focus();
}
function pmCloseDeleteDialog(){const layer=$('pm-delete-dialog');if(layer)layer.remove()}
function deletePromptTestVersion(){
 const p=findPrompt(S.pm&&S.pm.id);if(!p||p.st!=='test'||!isPromptCreator(p)){pmCloseDeleteDialog();toast('只有创建人可以删除自己的测试版本');return}
 const list=p.shared?PSHARED:PROMPTS,index=list.findIndex(x=>x.id===p.id);if(index<0)return;
 list.splice(index,1);closeMod();render();if(S.ag)drawAgent();toast('测试版本已删除')
}
function savePromptDraft(){const p=findPrompt(S.pm.id),d=S.pm;if(!p||p.st!=='test'||!isPromptCreator(p)){toast('只有创建人可以修改自己的测试版本');return}if(!validateNewPromptName(p,d))return;const savedAt=promptSaveTime();p.n=String(d.name||p.n).trim();p.isNew=false;p.body=d.body;p.blocks=d.blocks.slice();p.model=d.model;p.note=d.note.trim();p.by=promptCurrentName();p.at=savedAt;p.savedAt=savedAt;d.originalName=p.n;d.name=p.n;d.originalBody=d.body;d.originalModel=d.model;d.originalNote=d.note;d.lastSavedAt=savedAt;d.dirty=false;drawPrompt();render();if(S.ag)drawAgent();toast('修改已保存 · '+savedAt)}
function resetPromptChanges(){const p=findPrompt(S.pm&&S.pm.id),d=S.pm;if(!p||!d||p.st!=='test'||!isPromptCreator(p)){toast('当前版本不能清除更改');return}if(!d.dirty){toast('当前没有未保存的更改');return}d.name=d.originalName;d.body=d.originalBody;d.blocks=(p.blocks||promptBodyBlocks(d.originalBody)).slice();d.blockOpen=0;d.model=d.originalModel;d.note=d.originalNote;d.reasonOpen=false;d.dirty=false;drawPrompt();toast('已清除未保存的更改')}
function promptToTest(){const p=findPrompt(S.pm.id);p.body=S.pm.body;p.blocks=S.pm.blocks.slice();p.model=S.pm.model;if(p.st==='live'){toast('生效中的版本不能直接改成测试 · 已存为草稿');return}p.st='test';drawPrompt();render();if(S.ag)drawAgent();toast('已进入测试')}
function submitPrompt(){const p=findPrompt(S.pm.id),d=S.pm,bad=badSlots(p,d.body);if(!p||p.st!=='test'||!isPromptCreator(p)){toast('只有创建人可以提交自己的测试版本');return}const pending=otherPendingPromptVersion(p);if(pending){toast('v'+pending.v+' 正在待上线审核，当前版本暂不能提交');return}if(!validateNewPromptName(p,d))return;if(bad.length){toast('还有没声明的变量槽');return}if(p.ty==='run'&&!d.model){toast('可运行提示词要先选模型');return}if(!d.note.trim()){pmOpenReason();toast('提交上线必须填写改动备注');return}p.n=String(d.name||p.n).trim();p.isNew=false;p.body=d.body;p.blocks=d.blocks.slice();p.model=d.model;p.note=d.note.trim();p.st='pending';p.by=promptCurrentName();p.at='刚刚';(p.hist=p.hist||[]).unshift({v:p.v,by:promptCurrentName(),at:'刚刚',note:p.note});if(p.ag){S.pmPromptFilter=S.pmPromptFilter||{};S.pmPromptFilter[p.ag]='pending'}else S.pmSharedFilter='pending';closeMod();renderNav();render();if(S.ag)drawAgent();toast('已提交 · 等 '+promptOwner()+' 审核后生效')}
function withdrawPrompt(){const p=findPrompt(S.pm.id);if(!p||p.st!=='pending'||!isPromptCreator(p)){toast('只有创建人可以撤回自己的版本');return}p.st='test';if(p.ag){S.pmPromptFilter=S.pmPromptFilter||{};S.pmPromptFilter[p.ag]='test'}else S.pmSharedFilter='test';S.pm.originalBody=p.body;S.pm.originalModel=p.model;S.pm.originalNote=p.note&&p.note!=='—'?p.note:'';S.pm.dirty=false;drawPrompt();renderNav();render();if(S.ag)drawAgent();toast('已撤回 · 可以继续修改')}
function approvePrompt(id){
 const p=findPrompt(id);if(!p||p.st!=='pending'||!isPromptReviewer()){toast('只有 Brooks 可以审核待上线提示词');return}
 promptVersions(p).forEach(version=>{if(version.id!==p.id&&version.st==='live')version.st='retired'});p.st='live';p.approvedBy='Brooks';p.approvedAt='刚刚';if(p.ag){S.pmPromptFilter=S.pmPromptFilter||{};S.pmPromptFilter[p.ag]='live'}else S.pmSharedFilter='live';closeMod();renderNav();render();if(S.ag)drawAgent();toast('Brooks 已批准 · 新版本开始生效')
}
function returnPromptForChanges(id){
 const p=findPrompt(id);if(!p||p.st!=='pending'||!isPromptReviewer()){toast('只有 Brooks 可以审核待上线提示词');return}p.st='test';if(p.ag){S.pmPromptFilter=S.pmPromptFilter||{};S.pmPromptFilter[p.ag]='test'}else S.pmSharedFilter='test';closeMod();renderNav();render();if(S.ag)drawAgent();toast('Brooks 已退回 · 创建人可以继续修改')
}
function revertPrompt(id,v){const p=findPrompt(id);if(!p)return;const pending=pendingPromptVersion(p);if(pending){toast('v'+pending.v+' 正在待上线审核，审核完成前不能回滚');return}pmCloseRevertDialog();S.pmRevert={id,v};const layer=document.createElement('div');layer.id='pm-revert-dialog';layer.className='pm-confirm-layer';layer.onclick=e=>{if(e.target===layer)pmCloseRevertDialog()};layer.innerHTML=`<section class="pm-confirm-card pm-revert-confirm" role="dialog" aria-modal="true" aria-labelledby="pm-revert-title"><div class="pm-confirm-head"><span class="pm-confirm-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg></span><div><div class="ey">历史版本</div><h3 id="pm-revert-title">确认回到 v${v}？</h3></div><button class="ib" onclick="pmCloseRevertDialog()" aria-label="关闭">×</button></div><div class="pm-confirm-body"><strong>${esc(p.n)} · v${v}</strong><p>系统会基于这个历史版本提交回滚审核，当前使用中的版本不会立即被覆盖。</p></div><div class="pm-confirm-foot"><button class="btn ghost" onclick="pmCloseRevertDialog()">取消</button><button class="btn" onclick="confirmPromptRevert()">确认回到这版</button></div></section>`;layer.addEventListener('keydown',e=>{if(e.key==='Escape')pmCloseRevertDialog()});$('mod').appendChild(layer);layer.querySelector('.btn.ghost').focus()}
function pmCloseRevertDialog(){const layer=$('pm-revert-dialog');if(layer)layer.remove();S.pmRevert=null}
function confirmPromptRevert(){const draft=S.pmRevert;if(!draft)return;const p=findPrompt(draft.id),v=draft.v;pmCloseRevertDialog();toast('已提交回滚到 v'+v+' · 等 '+promptOwner(p)+' 批准');closeMod()}
function newPrompt(agid){const shared=!agid,stamp=Date.now(),p={id:'prompt-'+stamp,family:(shared?'shared-new|':'agent-new|'+agid+'|')+stamp,shared,ag:agid||undefined,n:'',isNew:true,ty:shared?'frag':'run',v:1,st:'test',model:shared?null:'gpt-5.4',by:promptCurrentName(),at:'刚刚',note:'',use:shared?[]:undefined,slots:shared?[]:(SLOTS[agid]||[]),body:'',hist:[]};(shared?PSHARED:PROMPTS).unshift(p);if(agid){S.pmPromptFilter=S.pmPromptFilter||{};S.pmPromptFilter[agid]='test'}else S.pmSharedFilter='test';openPrompt(p.id);setTimeout(()=>$('pm-name')?.focus(),0)}
renderNav();
