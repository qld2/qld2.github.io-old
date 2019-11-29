/**
 * Pushes vertex onto a vertex array
 */
function pushVertex(v, vArray)
{
    for(i=0;i<3;i++)
    {
        vArray.push(v[i]);
    }  
}

/**
 * Carves a ravine into the landscape
 * @param {yMin} min y of plane
 * @param {yMax} max y of plane
 * @param {vertexArray} vertexArray to be populated
 * @return the number of triangles
 */
function carveRavine(yMin, yMax, vertexArray) {
    var minZ = vertexArray[2];
    var len = vertexArray.length;   
    
    for (i = 0; i < len; i+=3) {
        if (vertexArray[i + 2] > minZ) minZ = vertexArray[i + 2];
    }
    
    var rand_yy = (yMax - yMin) * (Math.random() - 0.5);
    
    for (i = 0; i < len; i+=3) {
        if (Math.abs(vertexArray[i + 1] - rand_yy) < .025) vertexArray[i + 2] = minZ;
        else if (Math.abs(vertexArray[i + 1] - rand_yy) < .15) vertexArray[i + 2] = minZ / 2;
        else if (Math.abs(vertexArray[i + 1] - rand_yy) < .3) vertexArray[i + 2] = minZ / 4;
    }
}

/**
 * Generates the initial plane, randomly shapes it into terrain
 * and calculates the normal vectors
 * @param {numSubDivs} amount of times to subdivide in making plane
 * @param {numPartitions} amount of time to randomly partition
 * @param {xMin} min x of plane
 * @param {xMax} max x of plane
 * @param {yMin} min y of plane
 * @param {yMax} max y of plane
 * @param {vertexArray} vertexArray to be populated
 * @param {normalArray} normalArray to be populated
 * @return the number of triangles
 */
function terrainBuilder(numSubDivs, numPartitions, xMin, xMax, yMin, yMax, vertexArray, normalArray)
{
    var numT=0;
    var a = vec4.fromValues(xMax, yMax, 0.0,0);
    var b = vec4.fromValues(xMax, yMin, 0.0,0);
    var c = vec4.fromValues(xMin,yMin,0.0,0);
    var d = vec4.fromValues(xMin, yMax, 0.0,0);
    
    numT+=divideTriangle(a,b,c,numSubDivs, vertexArray, normalArray);
    numT+=divideTriangle(a,c,d,numSubDivs, vertexArray, normalArray);
    
    textureGround(numPartitions, xMin, xMax, yMin, yMax, vertexArray, normalArray);
    //for creative point
    //carveRavine(yMin, yMax, vertexArray);
    
    calculateNormals(vertexArray, normalArray);
    
    return numT;
}

/**
 * Calculates all the per vertex normals
 * @param {vertexArray} vertexArray to be populated
 * @param {normalArray} normalArray to be populated
 */
function calculateNormals(vertexArray, normalArray) {
    var len = vertexArray.length;
    //console.log(len, "=", normalArray.length);
        
    //for each point
    for (aa = 0; aa < len; aa+=3) {
        var avgX = 0;
        var avgY = 0;
        var avgZ = 0;
        
        var adjacent_faces = [];
        //for each triangle
        for (bb = 0; bb < len; bb += 9) {
            //if it is in the triangle
            
            var isA = (vertexArray[aa] == vertexArray[bb] && vertexArray[aa + 1] == vertexArray[bb + 1] 
                && vertexArray[aa + 2] == vertexArray[bb + 2]);
            var isB = (vertexArray[aa] == vertexArray[bb + 3] && vertexArray[aa + 1] == vertexArray[bb + 4] 
                && vertexArray[aa + 2] == vertexArray[bb + 5]);
            var isC = (vertexArray[aa] == vertexArray[bb + 6] && vertexArray[aa + 1] == vertexArray[bb + 7] 
                && vertexArray[aa + 2] == vertexArray[bb + 8]);
        
            if (isA || isB || isC) {
               //console.log("OK");
               var t1 = vec4.fromValues(vertexArray[bb], vertexArray[bb + 1], vertexArray[bb + 2]);
               var t2 = vec4.fromValues(vertexArray[bb + 3], vertexArray[bb + 4], vertexArray[bb + 5]);
               var t3 = vec4.fromValues(vertexArray[bb + 6], vertexArray[bb + 7], vertexArray[bb + 8]);
               
               pushVertex(t1, adjacent_faces);
               pushVertex(t2, adjacent_faces);
               pushVertex(t3, adjacent_faces);
            }
        }
        
        var len_adj = adjacent_faces.length;
        //console.log(len_adj / 9);
        
        
        //for each adjacent face
        for (cc = 0; cc < len_adj; cc += 9) {
            //calculate normal
            var t1 = vec3.fromValues(adjacent_faces[cc], adjacent_faces[cc + 1], adjacent_faces[cc + 2]);
            var t2 = vec3.fromValues(adjacent_faces[cc + 3], adjacent_faces[cc + 4], adjacent_faces[cc + 5]);
            var t3 = vec3.fromValues(adjacent_faces[cc + 6], adjacent_faces[cc + 7], adjacent_faces[cc + 8]);
            
            //console.log(t1[0] - t3[0]);
            
            var p1 = vec3.fromValues(t1[0] - t3[0], t1[1] - t3[1], t1[2] - t3[2]);
            var p2 = vec3.fromValues(t2[0] - t1[0], t2[1] - t1[1], t2[2] - t1[2]);
            
            //var normal = vec3.cross(t2, t1);
            
            var normal = vec4.fromValues(p1[1] * p2[2] - p2[1] * p1[2], p1[2] * p2[0] - p1[0] * p2[2], p1[0] * p2[1] - p1[1] * p2[0]);                                        
     
            vec3.normalize(normal, normal);
            
            //if (normal[0] != 0) console.log(normal[0], " ", normal[1], " ", normal[2]);
            
            //add normal to the average
            avgX += normal[0];
            avgY += normal[1];
            avgZ += normal[2];
        }
        
        //set the average as the normal for the vertex        
        avgX /= (len_adj / 9.0); 
        avgY /= (len_adj / 9.0); 
        avgZ/= (len_adj / 9.0); 
        
        var avg = vec4.fromValues(avgX, avgY, avgZ);
        
        //vec4.normalize(avg, avg);
        
        //console.log(avg[0], " ", avg[1], " ", avg[2]);
        
        normalArray[aa] = avg[0];
        normalArray[aa + 1] = avg[1];
        normalArray[aa + 2] = avg[2];
    }
}

/**
 * Determines if a point lies on the moving side of the random partition
 * @param {b} See drawing on https://illinois-cs418.github.io/assignments/mp2.html
 * @param {p} See drawing on https://illinois-cs418.github.io/assignments/mp2.html
 * @param {n} See drawing on https://illinois-cs418.github.io/assignments/mp2.html
 * @return true if lies on moving side
 */
function determineSide(b, p, n) {
     var sum = 0;
     
     for (j = 0; j < 3; j++) {
        sum += (b[j] - p[j]) * n[j];
     }     
     
     if (sum > 0) return false;
     return true;
}

/**
 * Randomly partitions the plane and either lifts or sinks all values on one
 * side of the plane.
 * 
 * @param {iter} amount of times to randomly partition and lift/sink
 * @param {xMin} min x of plane
 * @param {xMax} max x of plane
 * @param {yMin} min y of plane
 * @param {yMax} max y of plane
 * @param {vertexArray} vertexArray to be populated
 * @param {normalArray} normalArray to be populated
 * @return the number of triangles
 */
function textureGround(iter, xMin, xMax, yMin, yMax, vertexArray, normalArray) {
    var delta = .025;

    for (c = 0; c < iter; c++) {
        //I chose to use sign so that we dont always add to z. 
        //This way many iterations wont always bring the whole 
        //structure far from the camera
        var sign = Math.sign(Math.random() - 0.5);
        var d = sign * delta;
        
        var rand_x = (xMax - xMin) * (Math.random() - 0.5);
        var rand_y = (yMax - yMin) * (Math.random() - 0.5);
        var rand_theta = 2 * Math.PI * Math.random();
 
        //console.log(rand_x, " ", rand_y, " ", rand_theta);
 
        var p = vec4.fromValues(rand_x, rand_y, 0);
        
        var n = vec4.fromValues(Math.cos(rand_theta), Math.sin(rand_theta), 0);
        var len = vertexArray.length;
        
        for (i = 0; i < len; i+=3) {
            var b = [vertexArray[i], vertexArray[i + 1], vertexArray[i + 2]];       
            //console.log(vertexArray[i], vertexArray[i + 1], vertexArray[i + 2]);
            if (determineSide(b, p, n)) {
                vertexArray[i + 2] = vertexArray[i + 2] + d;
            }
            //console.log(vertexArray[i], vertexArray[i + 1], vertexArray[i + 2]);
        }
    }   
}

/**
 * Divides triangles to make the initial plane
 * @param {a} One corner of the triangle (vector)
 * @param {b} One corner of the triangle (vector)
 * @param {c} One corner of the triangle (vector)
 * @param {numSubDivs} amount of times to subdivide in making plane
 * @param {vertexArray} vertexArray to be populated
 * @param {normalArray} normalArray to be populated
 * @return the number of triangles generated
 */
function divideTriangle(a,b,c,numSubDivs, vertexArray, normalArray)
{
    if (numSubDivs>0)
    {
        var numT=0;
        var ab =  vec4.create();
        vec4.lerp(ab,a,b,0.5);
        
        var ac =  vec4.create();
        vec4.lerp(ac,a,c,0.5);
        
        var bc =  vec4.create();
        vec4.lerp(bc,b,c,0.5);
        
        numT+=divideTriangle(a,ab,ac,numSubDivs-1, vertexArray, normalArray);
        numT+=divideTriangle(ab,b,bc,numSubDivs-1, vertexArray, normalArray);
        numT+=divideTriangle(bc,c,ac,numSubDivs-1, vertexArray, normalArray);
        numT+=divideTriangle(ab,bc,ac,numSubDivs-1, vertexArray, normalArray);
        return numT;
    }
    else
    {
        // Add 3 vertices to the array
        
        pushVertex(a,vertexArray);
        pushVertex(b,vertexArray);
        pushVertex(c,vertexArray);
        
        var n = vec4.fromValues(0, 0, 1, 0);
        pushVertex(n, normalArray);
        pushVertex(n, normalArray);
        pushVertex(n, normalArray);
        return 1;
    }   
}
