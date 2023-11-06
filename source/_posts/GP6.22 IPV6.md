---
title: GP6.22 IPV6部署
categories:
  - - Diary
    - PlayStation
  - - Diary
    - Games
  - - Life
date: 2023-11-3 11:25:46
tags:
description:
output: word_document
---
<!-- 手动摘要 -->
简单部署GP6.22的IPV6方式。
<!-- more -->
# GP6.22 IPV6部署

1. 解压安装GP软件包

   ```bash
   tar -zxf gp6.tar.gz
   cd gp6/
   rpm -ivh --nodeps --force *.rpm
   ```

2. 添加hosts解析与免密登录

   ```bash
   2409:8004:5ac0:bbf3::5:1a jtwxyhzc-2.novalocal jtwxyhzc-2
   2409:8004:5ac0:bbf3::5:2  jtwxyhzc-5.novalocal jtwxyhzc-5
   2409:8004:5ac0:bbf3::5:a  jtwxyhzc-6.novalocal jtwxyhzc-6
   ```

3. 创建gpadmin用户与免密登录

   ```bash
   useradd gpadmin -r -m -g gpadmin
   passwd gpadmin
   
   ssh-keygen
   ssh-copy-id gpadmin@${hostname}
   ```

4. 设置工作目录权限

   ```bash
   chown -R gpadmin.gpadmin greenplum-db
   chown -R gpadmin.gpadmin greenplum-db-6.22.0/
   ```

5. 创建数据目录

   ```bash
   mkdir -p /data1/gp
   mkdir -p /data1/gp/m
   mkdir -p /data1/gp/p
   mkdir -p /data1/gp/master
   chmod -R 777 /data1
   chown -R gpadmin.gpadmin /data1
   ```

6. 创建主机文件

   ```bash
   cat << "EOF" > all_host
   jtwxyhzc-2
   jtwxyhzc-5
   jtwxyhzc-6
   EOF
   ```

7. 验证免密

   ```bash
    source greenplum_path.sh
    gpssh-exkeys -f all_host
   ```

8. 编辑配置文件

   ```bash
   # FILE NAME: gpinitsystem_config
   
   # Configuration file needed by the gpinitsystem
   
   ################################################
   #### REQUIRED PARAMETERS
   ################################################
   
   #### Name of this Greenplum system enclosed in quotes.
   ARRAY_NAME="Greenplum Data Platform"
   
   #### Naming convention for utility-generated data directories.
   SEG_PREFIX=gpseg
   
   #### Base number by which primary segment port numbers
   #### are calculated.
   PORT_BASE=6000
   
   #### File system location(s) where primary segment data directories
   #### will be created. The number of locations in the list dictate
   #### the number of primary segments that will get created per
   #### physical host (if multiple addresses for a host are listed in
   #### the hostfile, the number of segments will be spread evenly across
   #### the specified interface addresses).
   declare -a DATA_DIRECTORY=(/data/greenplum/primary)
   
   #### OS-configured hostname or IP address of the master host.
   MASTER_HOSTNAME=jtwxyhzc-6.novalocal
   
   #### File system location where the master data directory
   #### will be created.
   MASTER_DIRECTORY=/data/greenplum/master/
   
   #### Port number for the master instance.
   MASTER_PORT=5432
   
   #### Shell utility used to connect to remote hosts.
   TRUSTED_SHELL=ssh
   
   #### Maximum log file segments between automatic WAL checkpoints.
   CHECK_POINT_SEGMENTS=8
   
   #### Default server-side character set encoding.
   ENCODING=UNICODE
   
   ################################################
   #### OPTIONAL MIRROR PARAMETERS
   ################################################
   
   #### Base number by which mirror segment port numbers
   #### are calculated.
   MIRROR_PORT_BASE=7000
   
   #### File system location(s) where mirror segment data directories
   #### will be created. The number of mirror locations must equal the
   #### number of primary locations as specified in the
   #### DATA_DIRECTORY parameter.
   declare -a MIRROR_DATA_DIRECTORY=(/data/greenplum/mirror)
   
   
   ################################################
   #### OTHER OPTIONAL PARAMETERS
   ################################################
   
   #### Create a database of this name after initialization.
   DATABASE_NAME=lte_mr
   
   #### Specify the location of the host address file here instead of
   #### with the -h option of gpinitsystem.
   #MACHINE_LIST_FILE=/home/gpadmin/gpconfigs/hostfile_gpinitsystem
   ```

9. 初始化数据库

   ```bash
   gpinitsystem -c ./gpinitsystem_config -h /usr/local/greenplum-db/all_host -D
   export MASTER_DATA_DIRECTORY=/data1/gp/master/gpseg-1/
   ```

   