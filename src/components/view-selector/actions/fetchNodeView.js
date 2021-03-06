import consul from '../../../common/apis/consul';
import { FETCH_NODE_VIEW } from '../actionTypes';
import { Node, Service, Tag } from './tree';

const createNode = (title) => Node(title);

const createService = (title, parent) => Service(title, parent);

const createTag = (title, parent) => Tag(title, parent);

const createNodeView = nodeApiResponse => {
    const nodeName = nodeApiResponse.Node.Node;
    const services = Object.values(nodeApiResponse.Services);

    const nodeInTree = createNode(nodeName);

    services.forEach(service => {
        const serviceInTree = createService(service.Service, nodeInTree.title);

        Object.keys(service).forEach(key => {
            if (key === 'Tags') {
                service[key].forEach(tag => {
                    const tagInTree = createTag(tag, serviceInTree.title);

                    serviceInTree['children'].push(tagInTree);
                });
            }
        });

        nodeInTree['children'].push(serviceInTree);
    });

    return nodeInTree;
}

const fetchNodeView = () => async dispatch => {
    const nodeViewTreeData = [];
    
    const nodesRes = await consul.get('/catalog/nodes');
    const nodes = nodesRes.data;

    for (const i in nodes) {
        const nodeRes = await consul.get(`/catalog/node/${nodes[i].Node}`);
        const node = nodeRes.data;
        
        nodeViewTreeData.push(createNodeView(node));
    }

    dispatch({
        type: FETCH_NODE_VIEW,
        payload: nodeViewTreeData
    }); 
};

export default fetchNodeView;
